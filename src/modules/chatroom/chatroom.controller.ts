import { IsEmail, IsNotEmpty } from "class-validator";
import { ChatRoomService } from "./chatroom.service";
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import { ChatRoom, Message } from "../../models/chatroom.schema";
import { JwtService } from "@nestjs/jwt";
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
}
export class InviteDto {
  @IsNotEmpty()
  roomId: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
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
  constructor(
    private readonly chatRoomService: ChatRoomService,
    private readonly jwtService: JwtService,
  ) {}

  @Get()
  async getAllRoom(): Promise<ChatRoom[]> {
    return this.chatRoomService.findAll();
  }

  @Get("/id/:roomId")
  async getRoomById(@Param("roomId") roomId: string): Promise<ChatRoom> {
    return this.chatRoomService.findRoomById(roomId);
  }

  @Post("create")
  async createChatRoom(
    @Req() request: Request,
    @Body() chatRoomDto: ChatRoomDto,
  ): Promise<ChatRoom> {
    try {
      const cookie = request.cookies["jwt"];
      const data = await this.jwtService.verifyAsync(cookie);

      if (!data) {
        throw new UnauthorizedException();
      }

      return this.chatRoomService.create(data["email"], chatRoomDto);
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  @Get("my")
  async myRoom(@Req() request: Request) {
    try {
      const cookie = request.cookies["jwt"];
      const data = await this.jwtService.verifyAsync(cookie);

      if (!data) {
        throw new UnauthorizedException();
      }
      return this.chatRoomService.findUserRooms(data["email"]);
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  @Post("join")
  async joinRoom(
    @Req() request: Request,
    @Body() joinRoomDto: JoinRoomDto,
  ): Promise<ChatRoom> {
    try {
      const cookie = request.cookies["jwt"];
      const data = await this.jwtService.verifyAsync(cookie);

      if (!data) {
        throw new UnauthorizedException();
      }

      return this.chatRoomService
        .joinRoom(joinRoomDto.roomId, data["email"])
        .then((res) => {
          if (!res) {
            throw new BadRequestException("invalid roomId");
          }
          return res;
        });
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  @Post("invite")
  async inviteUser(@Req() request: Request, @Body() inviteDto: InviteDto) {
    try {
      const cookie = request.cookies["jwt"];
      const data = await this.jwtService.verifyAsync(cookie);

      if (!data) {
        throw new UnauthorizedException();
      }
    } catch (e) {
      throw new UnauthorizedException();
    }

    return await this.chatRoomService
      .joinRoom(inviteDto.roomId, inviteDto.email)
      .then((res) => {
        if (!res) {
          throw new BadRequestException("invalid roomId");
        }
        return res;
      })
      .then(() => {
        message: "success";
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
  async addMessage(
    @Req() request: Request,
    @Body() addMessageDto: AddMessageDto,
  ) {
    try {
      const cookie = request.cookies["jwt"];
      const data = await this.jwtService.verifyAsync(cookie);

      if (!data) {
        throw new UnauthorizedException();
      }
    } catch (e) {
      throw new UnauthorizedException();
    }

    return this.chatRoomService
      .addMessage(
        addMessageDto.roomId,
        addMessageDto.userId,
        addMessageDto.content,
      )
      .then(({ updateResult }) => {
        if (!updateResult.acknowledged) {
          throw new InternalServerErrorException();
        }
        if (updateResult.matchedCount < 1) {
          throw new BadRequestException({ message: "invalid roomId" });
        }
        return { message: "success" };
      });
  }
}
