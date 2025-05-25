import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reaction, ReactionDocument } from './schemas/reactions.schema';
import { Post, PostDocument } from '../post/schemas/post.schema';
import { CreateReactionDto } from './dto/create-reaction.dto';

@Injectable()
export class ReactionsService {
  constructor(
    @InjectModel(Reaction.name) private reactionModel: Model<ReactionDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {}

  async create(createReactionDto: CreateReactionDto): Promise<ReactionDocument> {
    const existing = await this.reactionModel.findOne({
      user: createReactionDto.user,
      post: createReactionDto.post,
    });

    let reaction: ReactionDocument;

    if (existing) {
      // إذا كان الـ reaction موجود، نحدث النوع
      existing.type = createReactionDto.type;
      reaction = await existing.save();
    } else {
      // إنشاء reaction جديد
      const createdReaction = new this.reactionModel(createReactionDto);
      reaction = await createdReaction.save();

      // إضافة الـ reaction إلى الـ post
      await this.postModel.findByIdAndUpdate(
        createReactionDto.post,
        { $push: { reactions: reaction._id } }
      );
    }

    // تحديث counters في الـ post
    await this.updatePostReactionCounts(createReactionDto.post);

    return reaction;
  }

  async findByPost(postId: string): Promise<ReactionDocument[]> {
    return this.reactionModel.find({ post: postId }).populate('user', '-password').exec();
  }

  async delete(id: string): Promise<void> {
    const reaction = await this.reactionModel.findById(id);
    if (!reaction) {
      throw new NotFoundException(`Reaction with ID ${id} not found`);
    }

    const postId = reaction.post.toString();

    // حذف الـ reaction
    await this.reactionModel.findByIdAndDelete(id);

    // إزالة الـ reaction من الـ post
    await this.postModel.findByIdAndUpdate(
      postId,
      { $pull: { reactions: id } }
    );

    // تحديث counters في الـ post
    await this.updatePostReactionCounts(postId);
  }

  // تحديث عدد الـ likes والـ dislikes في الـ post
  private async updatePostReactionCounts(postId: string): Promise<void> {
    const [likesCount, dislikesCount] = await Promise.all([
      this.reactionModel.countDocuments({ post: postId, type: 'like' }),
      this.reactionModel.countDocuments({ post: postId, type: 'dislike' })
    ]);

    await this.postModel.findByIdAndUpdate(postId, {
      likesCount,
      dislikesCount
    });
  }

  async updateAllPostsCounts(): Promise<void> {
    const posts: PostDocument[] = await this.postModel.find({ isDeleted: false });

    for (const post of posts) {
      if (post._id) {
        await this.updatePostReactionCounts(post._id.toString());
      }
    }
  }
}
