import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TicketService {
  /**
   * Generates a unique ticket number
   * Format: PREFIX-YEAR-UUID_SHORT
   */
  generateTicketNumber(prefix: string = 'BASE'): string {
    const year = new Date().getFullYear();
    const shortUuid = uuidv4().split('-')[0].toUpperCase();
    return `${prefix}-${year}-${shortUuid}`;
  }

  /**
   * Generates a QR Code as a Data URL (Base64)
   */
  async generateQrCode(text: string): Promise<string> {
    try {
      return await QRCode.toDataURL(text);
    } catch (err) {
      console.error('QR Code generation failed', err);
      throw new Error('Could not generate QR code');
    }
  }
}
