import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from './schema/user.schema';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import chalk from 'chalk';

@Injectable()
export class AuthService {
  private readonly rpName = 'WebAuthn Example';
  private readonly rpID = 'localhost:5173';
  private readonly origin = `https://${this.rpID}`;

  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
  ) {}

  async findOrCreateUserByEmail(
    username: string,
    email: string,
  ): Promise<UserDocument> {
    const user = await this.userModel
      .findOne({ email })
      .populate('passkeys')
      .exec();
    if (!user) {
      const newUser = new this.userModel({
        email,
        username,
        currentChallenge: '',
        passkeys: [],
      });
      await newUser.save();
      return newUser;
    }
    return user;
  }

  async generateRegistrationOptions(username: string, email: string) {
    const user = await this.findOrCreateUserByEmail(username, email);

    const options: PublicKeyCredentialCreationOptionsJSON =
      await generateRegistrationOptions({
        rpName: this.rpName,
        rpID: this.rpID,
        userName: user?.username ?? '',
        attestationType: 'none',
        excludeCredentials:
          user.passkeys.map((passkey) => ({
            id: passkey.cred_id,
            transports: passkey.transports,
          })) || [],
        authenticatorSelection: {
          residentKey: 'preferred',
          userVerification: 'preferred',
          authenticatorAttachment: 'platform',
        },
      });

    user.currentChallenge = options.challenge;
    console.log(
      chalk.bgCyan(
        'Generated registration options for user:' + options.challenge,
      ),
      user.currentChallenge,
    );
    await this.userModel.findOneAndUpdate(
      {
        _id: user._id,
      },
      {
        currentChallenge: options.challenge,
      },
    );

    return options;
  }
}
