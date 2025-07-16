import { RegistrationResponseJSON } from '@simplewebauthn/server';
import { IsEmail, IsString } from 'class-validator';

export class RegistrationStartDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;
}

export class RegistrationCompleteDto {
  @IsEmail()
  email: string;

  registrationResponse: RegistrationResponseJSON;
}
