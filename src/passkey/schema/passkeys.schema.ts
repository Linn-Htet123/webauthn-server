import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AuthenticatorTransportFuture } from '@simplewebauthn/server';
import { HydratedDocument } from 'mongoose';

export type PasskeyDocument = HydratedDocument<Passkey>;
@Schema()
export class Passkey {
  @Prop({ required: true })
  cred_id: string; // base64url string

  @Prop({ required: true, type: Buffer })
  cred_public_key: Buffer; // binary data

  @Prop({ required: true })
  webauthn_user_id: string; // base64url string

  @Prop({ required: true, default: 0 })
  counter: number;

  @Prop({ required: true, default: false })
  backup_eligible: boolean;

  @Prop({ required: true, default: false })
  backup_status: boolean;

  @Prop({ required: false, default: [] })
  transports: AuthenticatorTransportFuture[];

  @Prop({ required: true, default: Date.now })
  created_at: Date;

  @Prop({ required: false })
  last_used: Date;
}

export const PasskeySchema = SchemaFactory.createForClass(Passkey);
