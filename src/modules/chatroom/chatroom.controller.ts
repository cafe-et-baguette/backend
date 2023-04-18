import { IsNotEmpty } from "class-validator";
import { ChatRoomService } from "./chatroom.service";
import { Body, Controller, Get, Logger, Post, Query } from "@nestjs/common";
import { ChatRoom } from "../../models/chatroom.schema";
import { User } from "src/models/user.schema";
export class ChatRoomDto {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  users: string[];
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
    const chatRoom = this.chatRoomService.create(chatRoomDto);
    return chatRoom;
  }

  @Get("users")
  getUsersInRoom(@Query("id") id: string): Promise<User[]> {
    return this.chatRoomService.getUsersInRoom(id);
  }
}
