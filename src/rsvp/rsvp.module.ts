import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { RsvpService } from './rsvp.service';
import { RsvpController } from './rsvp.controller';
import { Attendee } from './entities/attendee.entity';
import { EmailProcessor } from './processors/email.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendee]),
    BullModule.registerQueue({
      name: 'email-queue',
    }),
  ],
  controllers: [RsvpController],
  providers: [RsvpService, EmailProcessor],
})
export class RsvpModule {}
