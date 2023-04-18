import { IsNotEmpty } from "class-validator";
import { ChatRoomService } from "./chatroom.service";
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import { ChatRoom, Message } from "../../models/chatroom.schema";
import { User } from "src/models/user.schema";
export class ChatRoomDto {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  emails: string[];
}
export class JoinRoomDto {
  @IsNotEmpty()
  roomId: string;

  @IsNotEmpty()
  userId: string; // TODO: Read from token
}
export class AddMessageDto {
  @IsNotEmpty()
  roomId: string;

  @IsNotEmpty()
  userId: string; // TODO: Read from token

  @IsNotEmpty()
  content: string;
}

@Controller("chatroom")
export class ChatRoomController {
  constructor(private readonly chatRoomService: ChatRoomService) {}
  @Get()
  async getAllRoom(): Promise<ChatRoom[]> {
    return this.chatRoomService.findAll();
  }

  @Post("create")
  createChatRoom(@Body() chatRoomDto: ChatRoomDto): Promise<ChatRoom> {
    // TODO: Now this request allows any participant to be added
    // TODO: it should automatically add the requested user (self) to the room
    // TODO: then only accept additional user that can be self
    const chatRoom = this.chatRoomService.create(chatRoomDto);
    return chatRoom;
  }

  @Post("join")
  joinRoom(@Body() joinRoomDto: JoinRoomDto): Promise<ChatRoom> {
    return this.chatRoomService
      .joinRoom(joinRoomDto.roomId, joinRoomDto.userId)
      .then((res) => {
        if (!res) {
          throw new BadRequestException("invalid roomId");
        }
        return res;
      });
  }

  @Get(":roomId/users")
  getUsersInRoom(@Param("roomId") roomId: string): Promise<User[]> {
    return this.chatRoomService.getUsersInRoom(roomId);
  }

  @Get(":roomId/messages")
  getAllMessages(@Param("roomId") roomId: string): Promise<Message[]> {
    return this.chatRoomService.getAllMessages(roomId);
  }

  @Post("add-message")
  addMessage(@Body() addMessageDto: AddMessageDto) {
    return this.chatRoomService
      .addMessage(
        addMessageDto.roomId,
        addMessageDto.userId,
        addMessageDto.content,
      )
      .then((res) => {
        if (!res.acknowledged) {
          throw new InternalServerErrorException();
        }
        if (res.matchedCount < 1) {
          throw new BadRequestException({ message: "invalid roomId" });
        }
        return { message: "success" };
      });
  }
}
