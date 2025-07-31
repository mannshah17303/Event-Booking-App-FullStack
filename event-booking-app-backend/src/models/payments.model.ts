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
import { Bookings } from "./bookings.model";
import { Users } from "./users.model";

@Table({ tableName: "Payments", timestamps: false })
export class Payments extends Model<Payments> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  payment_id!: string;

  @ForeignKey(() => Bookings)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  booking_id!: string;

  @ForeignKey(() => Users)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  user_id!: string;

  @Column({
    type: DataType.ENUM("pending", "paid", "failed"),
    defaultValue: "pending",
  })
  status!: "pending" | "paid" | "failed";

  @Column(DataType.DECIMAL(10, 2))
  amount!: number;

  @BelongsTo(() => Bookings)
  booking!: Bookings;
}
