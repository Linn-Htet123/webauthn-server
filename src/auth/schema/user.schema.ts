import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Passkey, PasskeySchema } from './passkeys.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  email: string;

  @Prop({ default: '' })
  currentChallenge: string;

  @Prop({ type: [PasskeySchema], default: [] })
  passkeys: Passkey[];
}

export const UserSchema = SchemaFactory.createForClass(User);
