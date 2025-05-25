import {
  Controller,
  Get,
  Post as HttpPost,
  Put,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { PostsService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { storage } from '../../multerCloudinaryStorage';
import type { Express } from 'express';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('all')
  async getAllPosts() {
    return this.postsService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @HttpPost()
  async createPost(@Request() req, @Body() body: CreatePostDto) {
    const postData = {
      ...body,
      user: req.user.userId,
    };
    return this.postsService.create(postData);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my-posts')
  async getMyPosts(@Request() req) {
    return this.postsService.findAllByUser(req.user.userId);
  }

  @Get('user/:userId')
  async getPostsByUser(@Param('userId') userId: string) {
    return this.postsService.findAllByUser(userId);
  }

  @Get('shared/:userId')
  async getSharedPostsByUser(@Param('userId') userId: string) {
    return this.postsService.findSharedPostsByUser(userId);
  }

  @Get(':id')
  async getPost(@Param('id') id: string) {
    const post = await this.postsService.findById(id);
    if (!post) {
      throw new ForbiddenException('Post not found');
    }
    return post;
  }

  @UseGuards(AuthGuard('jwt'))
  @HttpPost(':id/share')
  async sharePost(@Request() req, @Param('id') postId: string) {
    return this.postsService.sharePost(postId, req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async updatePost(@Request() req, @Param('id') id: string, @Body() body) {
    const post = await this.postsService.findById(id);
    if (!post) throw new ForbiddenException('Post not found');
    if (post.user['_id'].toString() !== req.user.userId) {
      throw new ForbiddenException('You are not allowed to edit this post');
    }
    return this.postsService.update(id, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deletePost(@Request() req, @Param('id') id: string) {
    const post = await this.postsService.findById(id);
    if (!post) throw new ForbiddenException('Post not found');
    if (post.user['_id'].toString() !== req.user.userId) {
      throw new ForbiddenException('You are not allowed to delete this post');
    }
    return this.postsService.delete(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @HttpPost('upload')
  @UseInterceptors(FileInterceptor('image', { storage }))
  async uploadImage(@UploadedFile() file: Express.Multer.File, @Request() req) {
    return {
      url: file.path,
      originalName: file.originalname,
      uploadedBy: req.user.userId,
    };
  }
}