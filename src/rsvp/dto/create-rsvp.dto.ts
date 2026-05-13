import { IsEmail, IsNotEmpty, IsBoolean, IsString, IsOptional, ValidateIf, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRsvpDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name of the attendee' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  fullName: string;

  @ApiProperty({ example: 'john@example.com', description: 'Email address' })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @ApiProperty({ example: '+2348012345678', description: 'Phone number' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  phoneNumber: string;

  @ApiProperty({ example: true, description: 'Attendance status' })
  @IsBoolean()
  isAttending: boolean;

  @ApiProperty({ example: false, description: 'Bringing a plus one?' })
  @IsBoolean()
  @IsOptional()
  bringingPlusOne: boolean = false;

  @ApiPropertyOptional({ example: 'Jane Doe', description: 'Plus one name' })
  @ValidateIf((o) => o.bringingPlusOne === true)
  @IsString()
  @IsNotEmpty({ message: 'Plus one name is required if you are bringing a plus one' })
  @MinLength(2)
  @Transform(({ value }) => value?.trim())
  plusOneName?: string;

  @ApiProperty({ example: 'uuid-v4-event-id', description: 'ID of the event' })
  @IsString()
  @IsNotEmpty()
  eventId: string;
}
