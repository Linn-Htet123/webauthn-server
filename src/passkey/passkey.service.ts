import { Injectable } from '@nestjs/common';
import { PasskeyRepository } from './repository/passkey.repository';
import { Passkey } from './schema/passkeys.schema';

@Injectable()
export class PasskeyService {
  constructor(private readonly passkeyRepository: PasskeyRepository) {}

  async createPasskey(passkey: Passkey) {
    return this.passkeyRepository.createPasskey(passkey);
  }
}
