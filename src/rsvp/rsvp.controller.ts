import { Controller, Post, Body, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { RsvpService } from './rsvp.service';
import { CreateRsvpDto } from './dto/create-rsvp.dto';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('api/v1/events/rsvp')
export class RsvpController {
  constructor(private readonly rsvpService: RsvpService) {}

  @Post()
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRsvpDto: CreateRsvpDto) {
    return this.rsvpService.create(createRsvpDto);
  }
}
