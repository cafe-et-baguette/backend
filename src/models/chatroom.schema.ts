import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ChatRoomDocument = ChatRoom & Document;

@Schema()
export class ChatRoom {
  @Prop({ required: true })
  name: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  users: MongooseSchema.Types.ObjectId[];
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);
