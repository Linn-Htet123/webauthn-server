import { IsString } from 'class-validator';

export class updateUserDto {
  @IsString()
  currentChallenge: string;
}
