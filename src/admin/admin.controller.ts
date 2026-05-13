import { Controller, Get, Post, Body, Param, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EventsService } from '../events/events.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from '../events/storage.service';

@Controller('api/v1/admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly storageService: StorageService,
  ) {}

  @Get('dashboard')
  async getStats() {
    return this.eventsService.getDashboardStats();
  }

  @Get('events')
  async listEvents() {
    return this.eventsService.getAllEvents();
  }

  @Post('events')
  @UseInterceptors(FileInterceptor('flyer'))
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
  async getAttendees(@Param('id') id: string) {
    return this.eventsService.getEventAttendees(id);
  }
}
