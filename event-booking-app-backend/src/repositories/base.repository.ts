import {
  Model,
  ModelStatic,
  FindOptions,
  CreateOptions,
  UpdateOptions,
  DestroyOptions,
} from "sequelize";
import { MakeNullishOptional } from "sequelize/types/utils";

export class BaseRepository<T extends Model> {
  private model: ModelStatic<T>;

  constructor(model: ModelStatic<T>) {
    this.model = model;
  }

  findAll(options?: FindOptions): Promise<T[]> {
    return this.model.findAll(options);
  }

  findById(id: number | string): Promise<T | null> {
    return this.model.findByPk(id);
  }

  findOne(options: FindOptions): Promise<T | null> {
    return this.model.findOne(options);
  }

  create(data: object, options?: CreateOptions): Promise<T> {
    return this.model.create(
      data as MakeNullishOptional<T["_creationAttributes"]>,
      options
    );
  }

  update(
    data: object | string,
    options: UpdateOptions
  ): Promise<[affectedCount: number]> {
    return this.model.update(data, options);
  }

  delete(options: DestroyOptions): Promise<number> {
    return this.model.destroy(options);
  }
}
