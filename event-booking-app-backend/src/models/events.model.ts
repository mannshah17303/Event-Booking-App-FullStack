import {
  AutoIncrement,
  BelongsToMany,
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { Favorites } from "./favorites.model";
import { Users } from "./users.model";

@Table({ tableName: "Events", timestamps: false })
export class Events extends Model<Events> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
  })
  event_id!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  event_title!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  event_date!: Date;

  @Column({
    type: DataType.STRING,
  })
  event_location!: string;

  @Column({
    type: DataType.STRING,
  })
  event_description!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  price!: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  image_url!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  ratings!: number;

  @BelongsToMany(() => Users, () => Favorites)
  favoritedBy!: Users[];
}
