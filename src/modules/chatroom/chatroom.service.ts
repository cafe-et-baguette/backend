import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { ChatRoom, Message } from "../../models/chatroom.schema";
import { ChatRoomDto } from "./chatroom.controller";
import { Injectable } from "@nestjs/common";
import { User } from "../../models/user.schema";

@Injectable()
export class ChatRoomService {
  constructor(
    @InjectModel(ChatRoom.name) private chatRoomModel: Model<ChatRoom>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel("message") private messageModel: Model<Message>,
  ) {}

  async create(chatRoomDto: ChatRoomDto): Promise<ChatRoom> {
    const userIds: Promise<Types.ObjectId>[] = chatRoomDto.emails.map(
      async (email) => {
        return (await this.userModel.findOne({ email: email }).exec())._id;
      },
    );

    return Promise.all(userIds).then((userIds) => {
      const chatRoom = new this.chatRoomModel({
        name: chatRoomDto.name,
        userIds: userIds,
      });
      return chatRoom.save();
    });
  }
  async findAll(): Promise<ChatRoom[]> {
    return this.chatRoomModel.find().exec();
  }

  async getUsersInRoom(roomId: string): Promise<User[]> {
    const users = (
      await this.chatRoomModel.findOne({ _id: roomId })
    ).userIds.map((userId) => {
      return this.userModel
        .findOne({ _id: userId })
        .select("name email")
        .exec();
    });
    return Promise.all(users).then((users) => users);
  }

  async getAllMessage(roomId: string): Promise<Message[]> {
    return (
      await this.chatRoomModel.findOne({ _id: roomId }).select("messages -_id")
    ).messages;
  }
  // async addMessage(userId: string, msg: string): Promise<Message> {
  //   const message = new this.messageModel({
  //     user: new Types.ObjectId(userId),
  //     message: msg,
  //     createdDate: new Date(),
  //   });
  //   return message.save();
  // }
}
