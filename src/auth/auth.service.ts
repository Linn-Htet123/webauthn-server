import { Injectable, NotFoundException } from '@nestjs/common';
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
import { UserService } from 'src/user/user.service';
import { PasskeyService } from 'src/passkey/passkey.service';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from 'src/user/dto/createUser.dto';
import { Passkey } from 'src/passkey/schema/passkeys.schema';

@Injectable()
export class AuthService {
  private rpName = 'WebAuthn Example';
  private rpID = 'localhost';
  private origin = `http://${this.rpID}:3000`;

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly passkeyService: PasskeyService,
  ) {
    this.rpName = this.configService.get<string>('RP_NAME') || this.rpName;
    this.rpID = this.configService.get<string>('RP_ID') || this.rpID;
    this.origin = this.configService.get<string>('ORIGIN') || this.origin;
  }

  async generateRegistrationOptions(
    createUser: CreateUserDto,
  ): Promise<PublicKeyCredentialCreationOptionsJSON> {
    const user = await this.userService.findOrCreateUserByEmail(createUser);
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
    await this.userService.updateUser(user._id, {
      currentChallenge: options.challenge,
    });

    return options;
  }

  async verifyRegistration({
    email,
    registrationResponse,
  }: {
    email: CreateUserDto['email'];
    registrationResponse: RegistrationResponseJSON;
  }): Promise<boolean> {
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const verification: VerifiedRegistrationResponse =
      await verifyRegistrationResponse({
        response: registrationResponse,
        expectedChallenge: user.currentChallenge,
        expectedOrigin: this.origin,
        expectedRPID: this.rpID,
      });

    const { registrationInfo, verified } = verification;

    if (!verified) {
      throw new Error('Registration verification failed');
    }

    const { credential } = registrationInfo!;

    const passkeyData: Passkey = {
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

    const passkey = await this.passkeyService.createPasskey(passkeyData);
    await this.userService.savePasskey(user._id, passkey);

    return verification.verified;
  }

  async generateLoginOptions({
    email,
  }: {
    email: CreateUserDto['email'];
  }): Promise<PublicKeyCredentialRequestOptionsJSON> {
    const user = await this.userService.findUserByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const options: PublicKeyCredentialRequestOptionsJSON =
      await generateAuthenticationOptions({
        rpID: this.rpID,
        allowCredentials: user.passkeys.map((passkey) => ({
          id: passkey.cred_id,
          transports: passkey.transports,
        })),
      });

    user.currentChallenge = options.challenge;
    await this.userService.updateUser(user._id, {
      currentChallenge: options.challenge,
    });

    return options;
  }

  async verifyLogin({
    email,
    loginResponse,
  }: {
    email: CreateUserDto['email'];
    loginResponse: AuthenticationResponseJSON;
  }): Promise<VerifiedAuthenticationResponse> {
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    const verification: VerifiedAuthenticationResponse =
      await verifyAuthenticationResponse({
        response: loginResponse,
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
