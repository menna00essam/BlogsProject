import { Controller, Post, Body, Get, Param, Delete, UseGuards } from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { JwtStrategy } from '../auth/jwt.strategy'; 

@Controller('reactions')
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @UseGuards(JwtStrategy)
  @Post()
  async create(@Body() createReactionDto: CreateReactionDto) {
    return this.reactionsService.create(createReactionDto);
  }

  @Get('post/:postId')
  async findByPost(@Param('postId') postId: string) {
    return this.reactionsService.findByPost(postId);
  }

  @UseGuards(JwtStrategy)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.reactionsService.delete(id);
    return { message: 'Reaction deleted successfully' };
  }
}
