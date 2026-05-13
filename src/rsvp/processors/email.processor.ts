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
      const { fullName, email } = job.data;
      
      this.logger.log(`Processing rsvp email for ${email}`);

      try {
        const { data, error } = await this.resend.emails.send({
          from: 'Base Sports <rsvp@basesports.io>',
          to: [email],
          subject: 'RSVP Confirmation - Base Sports Event',
          html: `
            <h1>Hello ${fullName},</h1>
            <p>Thank you for your RSVP to the Base Sports event! We have successfully received your details.</p>
            <p>If you're bringing a plus one, they're included in our list.</p>
            <p>See you there!</p>
            <br/>
            <p>Best regards,<br/>Base Sports Team</p>
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
