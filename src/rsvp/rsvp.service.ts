import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendee } from './entities/attendee.entity';
import { CreateRsvpDto } from './dto/create-rsvp.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class RsvpService {
  private readonly logger = new Logger(RsvpService.name);

  constructor(
    @InjectRepository(Attendee)
    private readonly attendeeRepository: Repository<Attendee>,
    @InjectQueue('email-queue')
    private readonly emailQueue: Queue,
  ) {}

  async create(createRsvpDto: CreateRsvpDto) {
    const existingAttendee = await this.attendeeRepository.findOne({
      where: { email: createRsvpDto.email },
    });

    if (existingAttendee) {
      throw new ConflictException('An RSVP with this email already exists.');
    }

    const attendee = this.attendeeRepository.create(createRsvpDto);
    const savedAttendee = await this.attendeeRepository.save(attendee);

    // Dispatch asynchronous email job
    try {
      await this.emailQueue.add(
        'dispatch_rsvp_email',
        {
          id: savedAttendee.id,
          fullName: savedAttendee.fullName,
          email: savedAttendee.email,
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
      // We don't throw here to ensure the user gets a 201 since the record is saved
    }

    return { id: savedAttendee.id };
  }
}
