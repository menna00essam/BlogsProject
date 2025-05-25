import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReactionDocument = Reaction & Document;

@Schema({ timestamps: true })
export class Reaction {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Post', required: true })
  post: Types.ObjectId;

  @Prop({ required: true })
  type: string;
}

export const ReactionSchema = SchemaFactory.createForClass(Reaction);
