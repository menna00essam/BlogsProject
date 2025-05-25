import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsController } from './post.controller';
import { Post, PostSchema } from './schemas/post.schema';
import { PostsService } from './post.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }])],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService, MongooseModule],
})
export class PostsModule {}