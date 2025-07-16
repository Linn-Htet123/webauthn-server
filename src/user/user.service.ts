import { Injectable } from '@nestjs/common';
import { UserRepository } from './repository/user.repository';
import { CreateUserDto } from './dto/createUser.dto';
import { updateUserDto } from './dto/updateUser.dto';
import { Types } from 'mongoose';
import { Passkey } from 'src/passkey/schema/passkeys.schema';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findUserByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async createNewUser(user: CreateUserDto) {
    return this.userRepository.create(user);
  }

  async findOrCreateUserByEmail(user: CreateUserDto) {
    let existingUser = await this.findUserByEmail(user.email);
    if (!existingUser) {
      existingUser = await this.createNewUser(user);
    }
    return existingUser;
  }

  async updateUser(id: Types.ObjectId, userData: Partial<updateUserDto>) {
    return this.userRepository.update(id, userData);
  }

  async savePasskey(userId: Types.ObjectId, passkey: Passkey) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    if (!user.passkeys) {
      user.passkeys = [];
    }
    user.passkeys.push(passkey);
    return this.userRepository.update(userId, { passkeys: user.passkeys });
  }
}
