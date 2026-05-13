import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { Attendee } from '../rsvp/entities/attendee.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Attendee)
    private readonly attendeeRepository: Repository<Attendee>,
  ) {}

  async createEvent(eventData: any) {
    const event = this.eventRepository.create(eventData);
    return this.eventRepository.save(event);
  }

  async getAllEvents() {
    return this.eventRepository.find({
      relations: ['attendees'],
    });
  }

  async getEventAttendees(eventId: string) {
    return this.attendeeRepository.find({
      where: { event: { id: eventId } },
      order: { createdAt: 'DESC' },
    });
  }

  async getDashboardStats() {
    const totalEvents = await this.eventRepository.count();
    const totalAttendees = await this.attendeeRepository.count();
    const recentAttendees = await this.attendeeRepository.find({
      take: 5,
      order: { createdAt: 'DESC' },
      relations: ['event'],
    });

    return {
      totalEvents,
      totalAttendees,
      recentAttendees,
    };
  }
}
