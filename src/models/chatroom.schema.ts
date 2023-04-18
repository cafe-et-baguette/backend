import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type ChatRoomDocument = ChatRoom & Document;

@Schema()
export class Message {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User" })
  user: MongooseSchema.Types.ObjectId;
  @Prop({ required: true })
  message: string;
  @Prop({ required: true })
  createdDate: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

@Schema()
export class ChatRoom {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: "User" })
  userIds: MongooseSchema.Types.ObjectId[];

  @Prop({ type: [MessageSchema], default: [] })
  messages: Message[];
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);
