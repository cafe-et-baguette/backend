import { IsNotEmpty } from "class-validator";
import { ChatRoomService } from "./chatroom.service";
import { Body, Controller, Get, Logger, Post, Query } from "@nestjs/common";
import { ChatRoom } from "../../models/chatroom.schema";
import { User } from "src/models/user.schema";
export class ChatRoomDto {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  emails: string[];
}
export class AddMessageDto {
  @IsNotEmpty()
  roomId: string;
  @IsNotEmpty()
  userId: string;
  @IsNotEmpty()
  msg: string;
}

@Controller("chatroom")
export class ChatRoomController {
  constructor(private readonly chatRoomService: ChatRoomService) {}
  @Get("all")
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

  @Get("users")
  getUsersInRoom(@Query("id") id: string): Promise<User[]> {
    return this.chatRoomService.getUsersInRoom(id);
  }

  @Post("add-message")
  addMessage(@Body() addMessageDto: AddMessageDto) {
    this.chatRoomService.addMessage(addMessageDto.userId, addMessageDto.msg);
  }
}
