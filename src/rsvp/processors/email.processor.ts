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
          from: this.configService.get('FROM_EMAIL') || 'Base Sports <noreply@baselinelive.com>',
          to: [email],
          subject: `Your Exclusive Entry Pass for ${eventTitle}`,
          html: `
            <div style="font-family: 'Playfair Display', serif, sans-serif; max-width: 600px; margin: auto; background-color: #0d0d0b; color: #ffffff; padding: 40px; border: 1px solid #c5a05933;">
              <div style="text-align: center; margin-bottom: 40px;">
                <h1 style="color: #c5a059; font-style: italic; font-weight: 400; font-size: 32px; letter-spacing: 2px;">Invitation Confirmed</h1>
                <div style="height: 1px; background: linear-gradient(to right, transparent, #c5a059, transparent); width: 150px; margin: 20px auto;"></div>
              </div>
              
              <p style="font-size: 16px; line-height: 1.6; color: #a1a19a;">Hello <strong>${fullName}</strong>,</p>
              <p style="font-size: 16px; line-height: 1.6; color: #a1a19a;">Your presence is confirmed for <strong>${eventTitle}</strong>. We look forward to welcoming you to this exclusive experience.</p>
              
              <div style="background: rgba(255,255,255,0.05); padding: 30px; border: 1px solid rgba(197,160,89,0.2); margin: 30px 0;">
                <p style="margin: 0; font-size: 20px; color: #ffffff; font-style: italic;">${eventTitle}</p>
                <p style="margin: 10px 0 0 0; color: #c5a059; text-transform: uppercase; font-size: 11px; letter-spacing: 3px;">
                  ${new Date(eventDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })} — ${eventLocation}
                </p>
              </div>

              <div style="text-align: center; margin: 40px 0;">
                <p style="text-transform: uppercase; font-size: 10px; letter-spacing: 4px; color: #c5a059; margin-bottom: 20px; font-weight: bold;">Digital Entry Pass</p>
                <div style="background: #ffffff; padding: 15px; display: inline-block; border-radius: 4px;">
                  <img src="${qrCode}" alt="Ticket QR Code" style="width: 180px; height: 180px;" />
                </div>
                <p style="font-family: monospace; color: #ffffff; font-size: 18px; margin-top: 20px; letter-spacing: 2px;">${ticketNumber}</p>
                <p style="font-size: 11px; color: #a1a19a; margin-top: 10px; text-transform: uppercase; letter-spacing: 2px;">Valid for one admission</p>
              </div>

              <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 30px; text-align: center;">
                <p style="font-size: 12px; color: #a1a19a; letter-spacing: 1px;">Base Sports & Entertainment</p>
              </div>
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
