import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ChatRoomModule } from './modules/chatroom/chatroom.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/nest'),
    AuthModule,
    ChatRoomModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
