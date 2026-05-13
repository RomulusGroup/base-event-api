import { Controller, Post, Body, UseGuards, HttpStatus, HttpCode, Get, Param } from '@nestjs/common';
import { RsvpService } from './rsvp.service';
import { CreateRsvpDto } from './dto/create-rsvp.dto';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('RSVP')
@Controller('api/v1/events/rsvp')
export class RsvpController {
  constructor(private readonly rsvpService: RsvpService) {}

  @Post()
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit an RSVP for an event' })
  @ApiResponse({ status: 201, description: 'RSVP successfully recorded and ticket generated.' })
  @ApiResponse({ status: 409, description: 'Conflict: This email is already registered for this event.' })
  @ApiResponse({ status: 429, description: 'Too many requests - Rate limited.' })
  async create(@Body() createRsvpDto: CreateRsvpDto) {
    return this.rsvpService.create(createRsvpDto);
  }

  @Get('verify/:ticketNumber')
  @ApiOperation({ summary: 'Verify a ticket by its number' })
  @ApiResponse({ status: 200, description: 'Ticket is valid.' })
  @ApiResponse({ status: 404, description: 'Ticket not found or invalid.' })
  async verify(@Param('ticketNumber') ticketNumber: string) {
    return this.rsvpService.verifyTicket(ticketNumber);
  }
}
