import { Controller, Get } from '@nestjs/common';
import { EventsService } from './events.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Events')
@Controller('api/v1/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'List all public events for RSVP' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved event list.' })
  async listEvents() {
    return this.eventsService.getAllEvents();
  }
}
