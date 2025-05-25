import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './post/post.module';
import { CommentsModule } from './comments/comments.module';
import { ReactionsModule } from './reactions/reactions.module';


@Module({
 imports: [
  ConfigModule.forRoot({ isGlobal: true }),
  MongooseModule.forRoot(process.env.MONGO_URI as string ),
  UsersModule,
  AuthModule,
  PostsModule,
  CommentsModule,
  ReactionsModule,
],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
