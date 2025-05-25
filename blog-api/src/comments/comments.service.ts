import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comments.schema';
import { Post, PostDocument } from '../post/schemas/post.schema';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {}

  async create(createCommentDto: CreateCommentDto): Promise<CommentDocument | null> {
    // إنشاء الكومنت
    const createdComment = new this.commentModel(createCommentDto);
    const savedComment = await createdComment.save();

    // إضافة الكومنت إلى البوست
    await this.postModel.findByIdAndUpdate(
      createCommentDto.post,
      { $push: { comments: savedComment._id } },
      { new: true }
    );

    // إرجاع الكومنت مع بيانات المؤلف
    return this.commentModel
      .findById(savedComment._id)
      .populate('author', '-password -email')
      .exec();
  }

  async findByPost(postId: string): Promise<CommentDocument[]> {
    return this.commentModel
      .find({ post: postId })
      .populate('author', '-password -email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<CommentDocument | null> {
    return this.commentModel.findById(id).exec();
  }

  async delete(id: string): Promise<void> {
    const comment = await this.commentModel.findById(id);
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    // حذف الكومنت من البوست
    await this.postModel.findByIdAndUpdate(
      comment.post,
      { $pull: { comments: comment._id } },
      { new: true }
    );

    // حذف الكومنت
    await this.commentModel.findByIdAndDelete(id);
  }
}