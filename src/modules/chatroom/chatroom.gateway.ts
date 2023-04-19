import { Logger } from "@nestjs/common";
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from "@nestjs/websockets";
import { Server } from "socket.io";
import { ChatRoomService } from "./chatroom.service";

export type ChatMessageResponse = {
  userId: string;
  roomId: string;
  content: string;
};

@WebSocketGateway({ cors: true })
export class ChatRoomGateway {
  constructor(private readonly chatRoomService: ChatRoomService) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage("send")
  async handleSentMessage(
    @MessageBody("roomId") roomId: string,
    @MessageBody("userId") userId: string,
    @MessageBody("content") content: string,
  ): Promise<WsResponse<unknown>> {
    // Add Message to Database
    await this.chatRoomService.addMessage(roomId, userId, content);

    const chatMessageResponse: ChatMessageResponse = {
      userId: userId,
      roomId: roomId,
      content: content,
    };

    // Broadcast message to everyone listening
    this.server.emit("broadcast", chatMessageResponse);

    // Return received message to sender
    return {
      event: "response",
      data: chatMessageResponse,
    };
  }
}
