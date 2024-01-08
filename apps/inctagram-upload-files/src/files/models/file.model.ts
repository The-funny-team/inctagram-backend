import { FileType } from '@libs/types/fileType.enum';
import { IFile } from '../interface/file.interface';
import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class File extends Document implements IFile {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, enum: FileType, type: String })
  fileType: FileType;

  @Prop({ required: true })
  originalname: string;

  @Prop({ required: true })
  format: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  fileId: string;
}

export const FileSchema = SchemaFactory.createForClass(File);
