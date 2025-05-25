import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async create(postData: Partial<Post>): Promise<PostDocument> {
    const newPost = new this.postModel(postData);
    return newPost.save();
  }

  async findAllByUser(userId: string): Promise<PostDocument[]> {
    return this.postModel
      .find({ user: userId, isDeleted: false })
      .populate('user', '-password -email')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: '-password -email'
        }
      })
      .populate('reactions')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findAll(): Promise<PostDocument[]> {
    return this.postModel
      .find({ isDeleted: false })
      .populate('user', '-password -email')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: '-password -email'
        }
      })
      .populate('reactions')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<PostDocument | null> {
    return this.postModel
      .findOne({ _id: id, isDeleted: false })
      .populate('user', '-password -email')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: '-password -email'
        }
      })
      .populate('reactions')
      .exec();
  }

  async update(id: string, updateData: Partial<Post>): Promise<PostDocument | null> {
    return this.postModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('user', '-password -email')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: '-password -email'
        }
      })
      .populate('reactions')
      .exec();
  }

  async delete(id: string): Promise<PostDocument | null> {
    return this.postModel
      .findByIdAndUpdate(id, { isDeleted: true }, { new: true })
      .populate('user', '-password -email')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: '-password -email'
        }
      })
      .populate('reactions')
      .exec();
  }

  async findSharedPostsByUser(userId: string): Promise<PostDocument[]> {
    return this.postModel
      .find({
        sharedBy: userId,
        isDeleted: false
      })
      .populate('user', '-password -email')
      .populate('sharedBy', '-password -email')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: '-password -email'
        }
      })
      .populate('reactions')
      .sort({ sharedAt: -1 })
      .exec();
  }

  async sharePost(postId: string, userId: string): Promise<PostDocument> {
    const originalPost = await this.findById(postId);
    if (!originalPost) {
      throw new Error('Post not found');
    }

    const sharedPost = new this.postModel({
      title: originalPost.title,
      description: originalPost.description,
      imageUrl: originalPost.imageUrl,
      user: originalPost.user,
      originalPost: postId,
      sharedBy: userId,
      sharedAt: new Date(),
      isShared: true
    });

    return sharedPost.save();
  }
}