import { Module } from "@nestjs/common";
import { ChatRoomController } from "./chatroom.controller";
import { ChatRoomService } from "./chatroom.service";
import {
  ChatRoom,
  ChatRoomSchema,
  MessageSchema,
} from "../../models/chatroom.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "../../models/user.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: ChatRoom.name, schema: ChatRoomSchema },
      { name: "message", schema: MessageSchema },
    ]),
  ],
  controllers: [ChatRoomController],
  providers: [ChatRoomService],
})
export class ChatRoomModule {}
