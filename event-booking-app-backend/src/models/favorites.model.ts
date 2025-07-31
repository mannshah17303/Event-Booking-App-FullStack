import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { Events } from "./events.model";
import { Users } from "./users.model";

@Table({ tableName: "Favorites", timestamps: false })
export class Favorites extends Model<Favorites> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
  })
  favorite_id!: string;

  @ForeignKey(() => Users)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  user_id!: string;

  @ForeignKey(() => Events)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  event_id!: number;

  @BelongsTo(() => Users)
  user!: Users;

  @BelongsTo(() => Events)
  event!: Events;
}
