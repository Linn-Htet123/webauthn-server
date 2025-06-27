import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/server';
import { CreateUserDto } from 'src/user/dto/createUser.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Get()
  healthCheck() {
    return { status: 'ok' };
  }
  @Post('register/start')
  async startRegistration(@Body() createUser: CreateUserDto) {
    const options =
      await this.authService.generateRegistrationOptions(createUser);
    return options;
  }

  @Post('register')
  async completeRegistration(
    @Body()
    body: {
      email: CreateUserDto['email'];
      registrationResponse: RegistrationResponseJSON;
    },
  ) {
    const isVerified = await this.authService.verifyRegistration(body);

    if (!isVerified) {
      throw new Error('Registration verification failed');
    }

    return { message: 'Registration completed' };
  }

  @Post('login/start')
  async startLogin(@Body() body: { email: CreateUserDto['email'] }) {
    const options = await this.authService.generateLoginOptions(body);
    return options;
  }

  @Post('login')
  async completeLogin(
    @Body()
    body: {
      email: CreateUserDto['email'];
      loginResponse: AuthenticationResponseJSON;
    },
  ) {
    const verification = await this.authService.verifyLogin(body);
    return { message: 'Login completed', verification };
  }
}
