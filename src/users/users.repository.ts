import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { isObjectIdString } from '../common/utils/object-id.js';
import { User, UserDocument } from './schemas/user.schema.js';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  findCredentialsByEmail(email: string) {
    return this.userModel
      .findOne({ email: email.toLowerCase().trim() })
      .select('+password')
      .exec();
  }

  findById(id: string) {
    if (!isObjectIdString(id)) {
      return Promise.resolve(null);
    }
    return this.userModel.findById(id).exec();
  }
}
