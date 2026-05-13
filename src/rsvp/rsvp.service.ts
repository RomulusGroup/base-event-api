import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendee } from './entities/attendee.entity';
import { Event } from '../events/entities/event.entity';
import { CreateRsvpDto } from './dto/create-rsvp.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { TicketService } from '../tickets/ticket.service';
import { StorageService } from '../events/storage.service';

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
    private readonly storageService: StorageService,
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
    
    // Generate both for different purposes
    const qrCodeBuffer = await this.ticketService.generateQrCodeBuffer(ticketNumber);
    const qrCodeUrl = await this.storageService.uploadQrCode(qrCodeBuffer, ticketNumber);
    const qrCodeDataUrl = await this.ticketService.generateQrCode(ticketNumber); // For instant frontend display

    // Guest Handling: Default to 1 if bringingPlusOne is true but guestCount not provided
    const guestCount = createRsvpDto.guestCount || (createRsvpDto.bringingPlusOne ? 1 : 0);
    const totalSpots = 1 + guestCount;

    // Capacity Check
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

    // Dispatch asynchronous email job with QR code URL and guest info
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
          qrCode: qrCodeUrl, // Using Hosted URL now
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
      qrCode: qrCodeDataUrl,
    };
  }

  async verifyTicket(ticketNumber: string) {
    const attendee = await this.attendeeRepository.findOne({
      where: { ticketNumber },
      relations: ['event'],
    });

    if (!attendee) {
      throw new ConflictException('Invalid ticket number.');
    }

    return {
      fullName: attendee.fullName,
      email: attendee.email,
      ticketNumber: attendee.ticketNumber,
      guestCount: attendee.guestCount,
      plusOneName: attendee.plusOneName,
      checkedIn: attendee.checkedIn,
      eventTitle: attendee.event.title,
      eventDate: attendee.event.date,
      eventLocation: attendee.event.location,
    };
  }
}
