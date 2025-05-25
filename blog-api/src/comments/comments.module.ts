import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Comment, CommentSchema } from './schemas/comments.schema';
import { Post, PostSchema } from '../post/schemas/post.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: Post.name, schema: PostSchema }
    ]),
  ],
  providers: [CommentsService],
  controllers: [CommentsController],
  exports: [CommentsService],
})
export class CommentsModule {}
