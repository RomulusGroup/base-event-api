import { IsEmail, IsNotEmpty, IsBoolean, IsString, IsOptional, ValidateIf, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateRsvpDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  phoneNumber: string;

  @IsBoolean()
  isAttending: boolean;

  @IsBoolean()
  @IsOptional()
  bringingPlusOne: boolean = false;

  @ValidateIf((o) => o.bringingPlusOne === true)
  @IsString()
  @IsNotEmpty({ message: 'Plus one name is required if you are bringing a plus one' })
  @MinLength(2)
  @Transform(({ value }) => value?.trim())
  plusOneName?: string;
}
