import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  HasOne,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt
} from "sequelize-typescript";
import { Events } from "./events.model";
import { Tickets } from "./tickets.model";
import { Users } from "./users.model";

@Table({ tableName: "Bookings", timestamps: true })
export class Bookings extends Model<Bookings> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
  })
  booking_id!: string;

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

  @Column({
    type: DataType.DATE,
  })
  booking_date!: Date;

  @CreatedAt
  @Column({ field: "createdAt" })
  createdAt!: Date;

  @UpdatedAt
  @Column({ field: "updatedAt" })
  updatedAt!: Date;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  ratings!: number;

  @BelongsTo(() => Users)
  user!: Users;

  @BelongsTo(() => Events)
  event!: Events;

  @HasOne(() => Tickets)
  ticket!: Tickets;
}
