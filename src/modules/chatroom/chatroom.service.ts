import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatRoom, Message } from '../../models/chatroom.schema';
import { ChatRoomDto } from './chatroom.controller';
import { Injectable, Logger } from '@nestjs/common';
import { User } from '../../models/user.schema';

@Injectable()
export class ChatRoomService {
  constructor(
    @InjectModel(ChatRoom.name) private chatRoomModel: Model<ChatRoom>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(chatRoomDto: ChatRoomDto): Promise<ChatRoom> {
    const chatRoom = new this.chatRoomModel({
      name: chatRoomDto.name,
      users: chatRoomDto.users.map(
        async (username) =>
          (await this.userModel.findOne({ name: username }).exec())._id,
      ),
    });
    return chatRoom.save();
  }
  async findAll(): Promise<ChatRoom[]> {
    return this.chatRoomModel.find().exec();
  }
  async getUsersInRoom(id: string): Promise<any> {
    return await this.chatRoomModel.findOne({ _id: id }).select('users -_id');
  }
  async sendMessage() {
    return '';
  }
}
