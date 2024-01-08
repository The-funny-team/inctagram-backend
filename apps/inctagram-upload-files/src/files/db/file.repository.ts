import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { File } from '../models/file.model';
import { Model, Types } from 'mongoose';
import { FileEntity } from '../entities/file.entity';

@Injectable()
export class FileRepository {
  constructor(
    @InjectModel(File.name) private readonly fileModel: Model<File>,
  ) {}

  async createFile(file: FileEntity) {
    const newFile = new this.fileModel(file);
    return newFile.save();
  }

  async updateFile({ _id, ...rest }: FileEntity) {
    return this.fileModel.updateOne({ _id }, { set$: { ...rest } });
  }

  async findFileById(id: string) {
    return this.fileModel.findById(id);
  }

  async deleteFile(id: string) {
    return this.fileModel.deleteOne({ _id: new Types.ObjectId(id) });
  }
}
