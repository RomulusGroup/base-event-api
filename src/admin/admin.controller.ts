import { Controller, Get, Post, Body, Param, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EventsService } from '../events/events.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from '../events/storage.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('api/v1/admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly storageService: StorageService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getStats() {
    return this.eventsService.getDashboardStats();
  }

  @Get('events')
  @ApiOperation({ summary: 'List all events' })
  async listEvents() {
    return this.eventsService.getAllEvents();
  }

  @Post('events')
  @UseInterceptors(FileInterceptor('flyer'))
  @ApiOperation({ summary: 'Create a new event' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        date: { type: 'string', format: 'date-time' },
        location: { type: 'string' },
        maxCapacity: { type: 'integer' },
        ticketPrefix: { type: 'string' },
        flyer: { type: 'string', format: 'binary' },
      },
    },
  })
  async createEvent(
    @Body() eventData: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    let flyerUrl = eventData.flyerUrl;
    
    if (file) {
      flyerUrl = await this.storageService.uploadFlyer(file);
    }
    
    return this.eventsService.createEvent({
      ...eventData,
      flyerUrl,
      date: new Date(eventData.date),
    });
  }

  @Get('events/:id/attendees')
  @ApiOperation({ summary: 'Get attendee list for a specific event' })
  async getAttendees(@Param('id') id: string) {
    return this.eventsService.getEventAttendees(id);
  }
}
