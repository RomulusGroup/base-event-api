import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';

@Processor('email-queue')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);
  private readonly resend: Resend;

  constructor(private configService: ConfigService) {
    super();
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.resend = new Resend(apiKey);
  }

  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name === 'dispatch_rsvp_email') {
      const { fullName, email, ticketNumber, eventTitle, eventDate, eventLocation, qrCode } = job.data;
      
      this.logger.log(`Processing rsvp email for ${email}`);

      try {
        const { data, error } = await this.resend.emails.send({
          from: 'Base Sports <rsvp@basesports.io>',
          to: [email],
          subject: `Your Ticket for ${eventTitle} - Base Sports`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
              <h1 style="color: #ea580c; text-transform: uppercase;">Ticket Confirmed!</h1>
              <p>Hello <strong>${fullName}</strong>,</p>
              <p>Your registration for <strong>${eventTitle}</strong> is successful.</p>
              
              <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #ea580c;">
                <p style="margin: 0; font-weight: bold; font-size: 1.2rem;">${eventTitle}</p>
                <p style="margin: 5px 0; color: #666;">${new Date(eventDate).toLocaleDateString()} at ${new Date(eventDate).toLocaleTimeString()}</p>
                <p style="margin: 5px 0; color: #666;">${eventLocation}</p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <p style="font-weight: bold; margin-bottom: 10px;">Ticket Number: <span style="color: #ea580c;">${ticketNumber}</span></p>
                <img src="${qrCode}" alt="Ticket QR Code" style="width: 200px; height: 200px; border: 5px solid #000; border-radius: 10px;" />
                <p style="font-size: 0.8rem; color: #888; margin-top: 10px;">Please present this QR code at the entrance.</p>
              </div>

              <p>Best regards,<br/>Base Sports Team</p>
            </div>
          `,
        });

        if (error) {
          throw new Error(`Resend Error: ${error.message}`);
        }

        this.logger.log(`Email sent successfully to ${email}. ID: ${data?.id}`);
        return data;
      } catch (error) {
        this.logger.error(`Failed to send email to ${email}: ${error.message}`);
        throw error; // Re-throw to trigger BullMQ retry
      }
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed after ${job.attemptsMade} attempts: ${error.message}`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed successfully.`);
  }
}
