import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReactionsService } from './reactions.service';
import { ReactionsController } from './reactions.controller';
import { Reaction, ReactionSchema } from './schemas/reactions.schema';
import { PostsModule } from '../post/post.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Reaction.name, schema: ReactionSchema }]),
    PostsModule, 
  ],
  providers: [ReactionsService],
  controllers: [ReactionsController],
  exports: [ReactionsService],
})
export class ReactionsModule {}