import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  userName: string;

  @IsString()
  userSurname: string;

  @IsEmail()
  userEmail: string;

  @IsString()
  @MinLength(6)
  password: string;
}
