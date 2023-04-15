import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';

@Module({

  imports: [MongooseModule.forRoot('mongodb://localhost/nest'), AuthModule],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
