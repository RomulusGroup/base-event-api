import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendee } from './entities/attendee.entity';
import { Event } from '../events/entities/event.entity';
import { CreateRsvpDto } from './dto/create-rsvp.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { TicketService } from '../tickets/ticket.service';

@Injectable()
export class RsvpService {
  private readonly logger = new Logger(RsvpService.name);

  constructor(
    @InjectRepository(Attendee)
    private readonly attendeeRepository: Repository<Attendee>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectQueue('email-queue')
    private readonly emailQueue: Queue,
    private readonly ticketService: TicketService,
  ) {}

  async create(createRsvpDto: any) {
    const { email, eventId } = createRsvpDto;

    const event = await this.eventRepository.findOne({ where: { id: eventId } });
    if (!event) {
      throw new ConflictException('Event not found.');
    }

    const existingAttendee = await this.attendeeRepository.findOne({
      where: { email, event: { id: eventId } },
    });

    if (existingAttendee) {
      throw new ConflictException('An RSVP with this email already exists for this event.');
    }

    const ticketNumber = this.ticketService.generateTicketNumber(event.ticketPrefix);
    const qrCode = await this.ticketService.generateQrCode(ticketNumber);

    // Guest Handling: Default to 1 if bringingPlusOne is true but guestCount not provided
    const guestCount = createRsvpDto.guestCount || (createRsvpDto.bringingPlusOne ? 1 : 0);
    const totalSpots = 1 + guestCount;

    // Capacity Check
    const currentAttendance = await this.attendeeRepository.count({ where: { event: { id: eventId } } });
    // Note: This is a simple count of attendees, we should actually sum their guestCount if we support multiple guests.
    // For now, I'll calculate total booked spots by summing (1 + guestCount) for all current attendees.
    const attendees = await this.attendeeRepository.find({ where: { event: { id: eventId } } });
    const totalBooked = attendees.reduce((sum, a) => sum + 1 + (a.guestCount || 0), 0);

    if (totalBooked + totalSpots > event.maxCapacity) {
      throw new ConflictException(`Apologies, this event has reached capacity. (Remaining spots: ${event.maxCapacity - totalBooked})`);
    }

    const attendee = this.attendeeRepository.create({
      fullName: createRsvpDto.fullName,
      email: createRsvpDto.email,
      phoneNumber: createRsvpDto.phoneNumber,
      isAttending: createRsvpDto.isAttending,
      bringingPlusOne: createRsvpDto.bringingPlusOne,
      guestCount,
      plusOneName: createRsvpDto.plusOneName,
      event,
      ticketNumber,
    });
    
    const savedAttendee = await this.attendeeRepository.save(attendee);

    // Dispatch asynchronous email job with QR code and guest info
    try {
      await this.emailQueue.add(
        'dispatch_rsvp_email',
        {
          id: savedAttendee.id,
          fullName: savedAttendee.fullName,
          email: savedAttendee.email,
          ticketNumber: savedAttendee.ticketNumber,
          eventTitle: event.title,
          eventDate: event.date,
          eventLocation: event.location,
          qrCode, 
          bringingPlusOne: savedAttendee.bringingPlusOne,
          guestCount: savedAttendee.guestCount,
          plusOneName: savedAttendee.plusOneName,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      );
      this.logger.log(`Email job dispatched for ${savedAttendee.email}`);
    } catch (error) {
      this.logger.error(`Failed to dispatch email job for ${savedAttendee.email}`, error.stack);
    }

    return { 
      id: savedAttendee.id,
      ticketNumber: savedAttendee.ticketNumber,
      qrCode,
    };
  }
}
