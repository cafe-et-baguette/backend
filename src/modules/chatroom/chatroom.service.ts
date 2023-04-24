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
  ) {}

  async create(
    creatorUserEmail: string,
    chatRoomDto: ChatRoomDto,
  ): Promise<ChatRoom> {
    const userIds: Promise<Types.ObjectId>[] = [
      creatorUserEmail,
      ...chatRoomDto.emails,
    ].map(async (email) => {
      return (await this.userModel.findOne({ email: email }).exec())._id;
    });

    return Promise.all(userIds).then((userIds) => {
      const chatRoom = new this.chatRoomModel({
        name: chatRoomDto.name,
        userIds: userIds,
      });
      return chatRoom.save();
    });
  }

  findAll(): Promise<ChatRoom[]> {
    return this.chatRoomModel.find().exec();
  }

  findRoomById(roomId: string): Promise<ChatRoom> {
    return this.chatRoomModel
      .findOne({ _id: new Types.ObjectId(roomId) })
      .exec();
  }

  async emailToUserId(email: string): Promise<Types.ObjectId> {
    return (await this.userModel.findOne({ email: email }).exec())._id;
  }

  findUserRooms(email: string): Promise<ChatRoom[]> {
    return this.emailToUserId(email).then((userId) =>
      this.chatRoomModel.find().elemMatch("userIds", { $eq: userId }).exec(),
    );
  }

  async joinRoom(roomId: string, email: string): Promise<ChatRoom> {
    return this.emailToUserId(email).then(async (userId) => {
      return (
        await this.chatRoomModel
          .findOneAndUpdate(
            { _id: new Types.ObjectId(roomId) },
            { $addToSet: { userIds: userId } },
            { new: true, rawResult: true },
          )
          .exec()
      ).value;
    });
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

  async getAllMessages(roomId: string): Promise<Message[]> {
    return (
      await this.chatRoomModel
        .findOne({ _id: roomId })
        .select("messages -_id")
        .exec()
    ).messages;
  }

  async addMessage(roomId: string, userId: string, content: string) {
    const messageCreatedDate = new Date();
    const res = await this.chatRoomModel.updateOne(
      {
        _id: new Types.ObjectId(roomId),
      },
      {
        $push: {
          messages: {
            userId: new Types.ObjectId(userId),
            content: content,
            createdDate: messageCreatedDate,
          },
        },
      },
    );
    return { updateResult: res, createdDate: messageCreatedDate };
  }

  async checkUserId(userId: string): Promise<boolean> {
    try {
      const res = await this.userModel
        .countDocuments({ _id: new Types.ObjectId(userId) })
        .exec();
      return res > 0;
    } catch {
      return false;
    }
  }
}
