import { IsOptional, IsString } from 'class-validator';

export class CreateOAuthUserDto {
  @IsString()
  provider: string;

  @IsString()
  providerId: string;

  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  userName?: string;

  @IsOptional()
  @IsString()
  userSurname?: string;
}
