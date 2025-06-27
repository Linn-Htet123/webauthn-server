import { Document, FilterQuery, UpdateQuery } from 'mongoose';
import { DeleteResult, UpdateResult } from 'mongodb';

export interface IBaseRepository<T extends Document> {
  create?(doc: Partial<T>): Promise<T>;
  findById?(id: string): Promise<T | null>;
  findOne?(filter: FilterQuery<T>): Promise<T | null>;
  findAll?(filter?: FilterQuery<T>): Promise<T[]>;
  update?(id: string, update: UpdateQuery<T>): Promise<T | null>;
  updateMany?(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
  ): Promise<UpdateResult>;
  delete?(id: string): Promise<boolean>;
  deleteMany?(filter: FilterQuery<T>): Promise<DeleteResult>;
  count?(filter?: FilterQuery<T>): Promise<number>;
  exists?(filter: FilterQuery<T>): Promise<boolean>;
}
