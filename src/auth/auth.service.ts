import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from './schema/user.schema';
import {
  AuthenticationResponseJSON,
  generateAuthenticationOptions,
  generateRegistrationOptions,
  RegistrationResponseJSON,
  VerifiedAuthenticationResponse,
  VerifiedRegistrationResponse,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { Passkey } from './schema/passkeys.schema';

@Injectable()
export class AuthService {
  private readonly rpName = 'WebAuthn Example';
  private readonly rpID = 'localhost';
  private readonly origin = `http://${this.rpID}:5173`;

  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
  ) {}

  async findUserByEmail(email: string): Promise<UserDocument | null> {
    const user = await this.userModel
      .findOne({ email })
      .populate('passkeys')
      .exec();

    if (!user) {
      return null;
    }

    return user;
  }

  async createNewUser(username: string, email: string): Promise<UserDocument> {
    const newUser = new this.userModel({
      username,
      email,
      passkeys: [],
      currentChallenge: '',
    });

    try {
      const savedUser = await newUser.save();

      return savedUser;
    } catch (error) {
      throw new Error('Error creating new user' + error);
    }
  }

  async findOrCreateUserByEmail(
    username: string,
    email: string,
  ): Promise<UserDocument> {
    const user = await this.findUserByEmail(email);
    if (!user) {
      return await this.createNewUser(username, email);
    }
    return user;
  }

  async generateRegistrationOptions(
    user: UserDocument,
  ): Promise<PublicKeyCredentialCreationOptionsJSON> {
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
    console.log(user.currentChallenge);
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

  async verifyRegistration(
    body: RegistrationResponseJSON,
    user: UserDocument,
  ): Promise<VerifiedRegistrationResponse> {
    const verification: VerifiedRegistrationResponse =
      await verifyRegistrationResponse({
        response: body,
        expectedChallenge: user.currentChallenge,
        expectedOrigin: this.origin,
        expectedRPID: this.rpID,
      });

    const { verified } = verification;

    if (!verified) {
      throw new Error('Registration verification failed');
    }
    return verification;
  }

  async savePasskey(
    user: UserDocument,
    verification: VerifiedRegistrationResponse,
  ): Promise<Passkey> {
    const { registrationInfo } = verification;
    const { credential } = registrationInfo!;

    const passkey: Passkey = {
      cred_id: credential.id,
      cred_public_key: Buffer.from(credential.publicKey),
      webauthn_user_id: user._id.toString(),
      counter: credential.counter,
      backup_eligible: false,
      backup_status: false,
      transports: credential.transports || [],
      last_used: new Date(),
      created_at: new Date(),
    };

    user.passkeys.push(passkey);
    await user.save();

    return passkey;
  }

  async generateLoginOptions(user: UserDocument) {
    const options: PublicKeyCredentialRequestOptionsJSON =
      await generateAuthenticationOptions({
        rpID: this.rpID,
        allowCredentials: user.passkeys.map((passkey) => ({
          id: passkey.cred_id,
          transports: passkey.transports,
        })),
      });

    user.currentChallenge = options.challenge;

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

  async verifyLogin(
    body: AuthenticationResponseJSON,
    user: UserDocument,
  ): Promise<VerifiedAuthenticationResponse> {
    const verification: VerifiedAuthenticationResponse =
      await verifyAuthenticationResponse({
        response: body,
        expectedChallenge: user.currentChallenge,
        expectedOrigin: this.origin,
        expectedRPID: this.rpID,
        credential: {
          id: user.passkeys[0].cred_id,
          publicKey: user.passkeys[0].cred_public_key,
          counter: user.passkeys[0].counter,
          transports: user.passkeys[0].transports,
        },
      });

    const { verified } = verification;

    if (!verified) {
      throw new Error('Login verification failed');
    }
    return verification;
  }
}
