import { IsMongoId, IsString, IsIn } from 'class-validator';

export class CreateReactionDto {
  @IsMongoId()
  user: string;

  @IsMongoId()
  post: string;

  @IsString()
  @IsIn(['like', 'love', 'haha', 'sad', 'angry']) 
  type: string;
}
