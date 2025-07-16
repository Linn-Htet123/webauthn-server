import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { PasskeyModule } from './passkey/passkey.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(
      'mongodb://root:example@localhost:27017/auth?authSource=admin',
    ),
    AuthModule,
    UserModule,
    PasskeyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
