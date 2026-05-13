import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { EventsService } from './events.service';
import { StorageService } from './storage.service';
import { AdminController } from '../admin/admin.controller';
import { Attendee } from '../rsvp/entities/attendee.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, Attendee]),
  ],
  providers: [EventsService, StorageService],
  controllers: [AdminController],
  exports: [EventsService, TypeOrmModule, StorageService],
})
export class EventsModule {}
