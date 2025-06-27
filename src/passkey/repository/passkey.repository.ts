// user/user.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from 'src/repositories/base.repository';
import { Passkey, PasskeyDocument } from '../schema/passkeys.schema';

@Injectable()
export class PasskeyRepository extends BaseRepository<PasskeyDocument> {
  constructor(
    @InjectModel(Passkey.name)
    private readonly passkeyModel: Model<PasskeyDocument>,
  ) {
    super(passkeyModel);
  }

  async createPasskey(passkey: Passkey): Promise<Passkey> {
    const newPasskey = new this.passkeyModel(passkey);
    return newPasskey.save();
  }
}
