import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  toObject(): { [x: string]: any; password: any; } {
    throw new Error('Method not implemented.');
  }
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
isDeleted: boolean;

}

export const UserSchema = SchemaFactory.createForClass(User);
