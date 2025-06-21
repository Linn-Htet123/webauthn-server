import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Get()
  healthCheck() {
    return { status: 'ok' };
  }
  @Post('register/start')
  async startRegistration(@Body() body: { username: string; email: string }) {
    await this.authService.generateRegistrationOptions(
      body.username,
      body.email,
    );
    return { message: 'Registration started' };
  }
}
