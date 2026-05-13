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

    const attendee = this.attendeeRepository.create({
      fullName: createRsvpDto.fullName,
      email: createRsvpDto.email,
      phoneNumber: createRsvpDto.phoneNumber,
      isAttending: createRsvpDto.isAttending,
      bringingPlusOne: createRsvpDto.bringingPlusOne,
      plusOneName: createRsvpDto.plusOneName,
      event,
      ticketNumber,
    });
    
    const savedAttendee = await this.attendeeRepository.save(attendee);

    // Dispatch asynchronous email job with QR code
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
          qrCode, // Base64 QR code
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
