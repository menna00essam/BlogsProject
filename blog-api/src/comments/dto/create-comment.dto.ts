import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsMongoId()
  @IsNotEmpty()
  post: string;

  @IsMongoId()
  @IsNotEmpty()
  author: string;
}