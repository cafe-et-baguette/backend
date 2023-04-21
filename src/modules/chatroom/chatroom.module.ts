import { Module } from "@nestjs/common";
import { ChatRoomController } from "./chatroom.controller";
import { ChatRoomService } from "./chatroom.service";
import { ChatRoom, ChatRoomSchema } from "../../models/chatroom.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "../../models/user.schema";
import { ChatRoomGateway } from "./chatroom.gateway";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: ChatRoom.name, schema: ChatRoomSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get("SECRET_KEY"),
        signOptions: { expiresIn: configService.get("JWT_EXPIRES_IN") },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ChatRoomController],
  providers: [ChatRoomService, ChatRoomGateway],
})
export class ChatRoomModule {}
