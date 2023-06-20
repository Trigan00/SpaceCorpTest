import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import { User, UserDocument } from './users.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    const user = new this.userModel({ ...dto, _id: uuidv4() });
    return user.save();
  }
  async getAllUsers(): Promise<User[]> {
    const users = this.userModel.find().exec();
    return users;
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = this.userModel.findOne({ email });
    return user;
  }
}
