import { Body, Controller, Get, Post, Session } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/server';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Get()
  healthCheck() {
    return { status: 'ok' };
  }
  @Post('register/start')
  async startRegistration(
    @Body() body: { username: string; email: string },
    @Session() session: Record<string, any>,
  ) {
    const user = await this.authService.findOrCreateUserByEmail(
      body.username,
      body.email,
    );
    session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
    };

    const options = await this.authService.generateRegistrationOptions(user);
    return options;
  }

  @Post('register')
  async completeRegistration(
    @Body()
    body: {
      email: string;
      registrationResponse: RegistrationResponseJSON;
    },
  ) {
    const user = await this.authService.findUserByEmail(body.email);
    if (!user) {
      throw new Error('User not found');
    }

    const verification = await this.authService.verifyRegistration(
      body.registrationResponse,
      user,
    );
    await this.authService.savePasskey(user, verification);

    return { message: 'Registration completed' };
  }

  @Post('login/start')
  async startLogin(@Body() body: { email: string }) {
    const user = await this.authService.findUserByEmail(body.email);
    if (!user) {
      throw new Error('User not found');
    }

    const options = await this.authService.generateLoginOptions(user);
    return options;
  }

  @Post('login')
  async completeLogin(
    @Body()
    body: {
      email: string;
      loginResponse: AuthenticationResponseJSON;
    },
  ) {
    const user = await this.authService.findUserByEmail(body.email);

    if (!user) {
      throw new Error('User not found');
    }

    const verification = await this.authService.verifyLogin(
      body.loginResponse,
      user,
    );
    return { message: 'Login completed', verification };
  }
}
