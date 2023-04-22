import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "../../models/user.schema";
import { Model } from "mongoose";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(data: any): Promise<User> {
    const user = new this.userModel(data);
    return user.save();
  }

  async findOne(condition: any): Promise<User> {
    return this.userModel.findOne(condition).exec();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async renameUser(userId: string, newName: string): Promise<User> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    user.name = newName;

    return user.save();
  }

  async userById(userId: string): Promise<User> {
    return this.userModel.findOne({ _id: userId }).select("name email").exec();
  }
}
