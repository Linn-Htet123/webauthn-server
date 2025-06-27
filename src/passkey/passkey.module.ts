import { Module } from '@nestjs/common';
import { PasskeyService } from './passkey.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Passkey, PasskeySchema } from './schema/passkeys.schema';
import { PasskeyRepository } from './repository/passkey.repository'; // <-- Add this

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Passkey.name,
        schema: PasskeySchema,
      },
    ]),
  ],
  providers: [PasskeyService, PasskeyRepository],
  exports: [PasskeyService],
})
export class PasskeyModule {}
