import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BeforeSave,
  BelongsTo,
} from "sequelize-typescript";
import { Bookings } from "./bookings.model";

@Table({ tableName: "Tickets", timestamps: false })
export class Tickets extends Model<Tickets> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
  })
  ticket_id!: number;

  @ForeignKey(() => Bookings)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  booking_id!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
  })
  quantity!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  price_per_ticket!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  total_amount!: number;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  purchase_date!: Date;

  @BeforeSave
  static calculateTotalAmount(ticket: Tickets) {
    if (ticket.quantity && ticket.price_per_ticket) {
      ticket.total_amount =
        Number(ticket.quantity) * Number(ticket.price_per_ticket);
    }
  }

  @BelongsTo(() => Bookings)
  booking!: Bookings;
}
