import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    const accessKeyId = this.configService.get<string>('DO_SPACES_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('DO_SPACES_SECRET_ACCESS_KEY');

    if (!accessKeyId || !secretAccessKey) {
      throw new Error('DigitalOcean Spaces Credentials not found in environment');
    }

    this.s3Client = new S3Client({
      endpoint: this.configService.get<string>('DO_SPACES_ENDPOINT'),
      region: this.configService.get<string>('DO_SPACES_REGION'),
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });
    this.bucketName = this.configService.get<string>('DO_SPACES_BUCKET') || '';
  }

  async uploadFlyer(file: Express.Multer.File): Promise<string> {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `flyers/${uuidv4()}.${fileExtension}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: fileName,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read',
        }),
      );

      const endpoint = this.configService.get<string>('DO_SPACES_ENDPOINT');
      // Construct the public URL
      return `https://${this.bucketName}.${endpoint}/${fileName}`;
    } catch (error) {
      console.error('S3 Upload Error:', error);
      throw new Error('Failed to upload file to storage');
    }
  }
}
