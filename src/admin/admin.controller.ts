import { Controller, Get, Post, Body, Param, UseInterceptors, UploadedFiles, UseGuards, Delete } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
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
  @UseInterceptors(AnyFilesInterceptor())
  @ApiOperation({ summary: 'Create a new event' })
  @ApiConsumes('multipart/form-data')
  async createEvent(
    @Body() eventData: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const galleryUrls: string[] = [];
    
    if (files && files.length > 0) {
      for (const file of files) {
        if (file.fieldname === 'gallery') {
          const url = await this.storageService.uploadFlyer(file);
          galleryUrls.push(url);
        }
      }
    }
    
    return this.eventsService.createEvent({
      ...eventData,
      galleryUrls,
      date: new Date(eventData.date),
    });
  }

  @Get('events/:id')
  @ApiOperation({ summary: 'Get a specific event' })
  async getEvent(@Param('id') id: string) {
    return this.eventsService.getEventById(id);
  }

  @Post('events/:id')
  @UseInterceptors(AnyFilesInterceptor())
  @ApiOperation({ summary: 'Update an existing event' })
  @ApiConsumes('multipart/form-data')
  async updateEvent(
    @Param('id') id: string,
    @Body() eventData: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    let galleryUrls: string[] = eventData.galleryUrls ? JSON.parse(eventData.galleryUrls) : [];
    
    if (files && files.length > 0) {
      for (const file of files) {
        if (file.fieldname === 'gallery') {
          const url = await this.storageService.uploadFlyer(file);
          galleryUrls.push(url);
        }
      }
    }
    
    return this.eventsService.updateEvent(id, {
      ...eventData,
      galleryUrls,
    });
  }

  @Delete('events/:id')
  @ApiOperation({ summary: 'Delete an event' })
  async deleteEvent(@Param('id') id: string) {
    return this.eventsService.deleteEvent(id);
  }

  @Get('events/:id/attendees')
  @ApiOperation({ summary: 'Get attendee list for a specific event' })
  async getAttendees(@Param('id') id: string) {
    return this.eventsService.getEventAttendees(id);
  }

  @Delete('attendees/:id')
  @ApiOperation({ summary: 'Remove an attendee' })
  async deleteAttendee(@Param('id') id: string) {
    return this.eventsService.deleteAttendee(id);
  }
}
