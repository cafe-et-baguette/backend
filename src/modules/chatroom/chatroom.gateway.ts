import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from "@nestjs/websockets";
import { Server } from "socket.io";
import { ChatRoomService } from "./chatroom.service";
import { BadRequestException } from "@nestjs/common";

export type ChatMessageResponse = {
  userId: string;
  roomId: string;
  content: string;
  createdDate: Date;
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
    // Check user id
    const validUserId = await this.chatRoomService.checkUserId(userId);
    if (!validUserId) {
      return {
        event: "fail",
        data: "invalid user id",
      };
    }
    // Add Message to Database
    return this.chatRoomService
      .addMessage(roomId, userId, content)
      .then(({ updateResult, createdDate }) => {
        // Check mongodb update result
        if (!updateResult.acknowledged) {
          return {
            event: "fail",
            data: "internal server error",
          };
        }
        if (updateResult.matchedCount < 1) {
          return {
            event: "fail",
            data: "invalid room id",
          };
        }

        // Build Response
        const chatMessageResponse: ChatMessageResponse = {
          userId: userId,
          roomId: roomId,
          content: content,
          createdDate: createdDate,
        };

        // Broadcast message to everyone listening
        this.server.emit("broadcast", chatMessageResponse);

        // Return received message to sender
        return {
          event: "success",
          data: chatMessageResponse,
        };
      });
  }
}
