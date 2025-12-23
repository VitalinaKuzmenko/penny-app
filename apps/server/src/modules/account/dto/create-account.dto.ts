import { IsString, IsUUID } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  name: string;

  @IsUUID()
  userId: string;
}
