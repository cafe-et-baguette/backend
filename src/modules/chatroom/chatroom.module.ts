import { Module } from '@nestjs/common';
import { ChatRoomController } from './chatroom.controller';
import { ChatRoomService } from './chatroom.service';
import { ChatRoom, ChatRoomSchema } from 'src/models/chatroom.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/models/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: ChatRoom.name, schema: ChatRoomSchema },
    ]),
  ],
  controllers: [ChatRoomController],
  providers: [ChatRoomService],
})
export class ChatRoomModule {}
