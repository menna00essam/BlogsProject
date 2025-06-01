import { Controller, Post, Body, Get, Param, Delete, UseGuards, Request, NotFoundException, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Request() req, @Body() createCommentDto: Omit<CreateCommentDto, 'author'>) {
    const commentData = {
      ...createCommentDto,
      author: req.user.userId,
    };
    return this.commentsService.create(commentData);
  }

  @Get('post/:postId')
  async findByPost(@Param('postId') postId: string) {
    return this.commentsService.findByPost(postId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async delete(@Request() req, @Param('id') id: string) {
    const comment = await this.commentsService.findById(id);
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
    
    if (comment.author.toString() !== req.user.userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }
    
    await this.commentsService.delete(id);
    return { message: 'Comment deleted successfully' };
  }
}