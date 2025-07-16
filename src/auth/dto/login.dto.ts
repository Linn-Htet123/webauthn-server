import { IsEmail } from 'class-validator';
import { AuthenticationResponseJSON } from '@simplewebauthn/server';

export class LoginStartDto {
  @IsEmail()
  email: string;
}

export class LoginCompleteDto {
  @IsEmail()
  email: string;

  loginResponse: AuthenticationResponseJSON;
}
