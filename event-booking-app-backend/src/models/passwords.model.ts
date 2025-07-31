import {
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import { Users } from "./users.model";

@Table({ tableName: "Passwords", timestamps: true })
export class Passwords extends Model<Passwords> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  password_id!: string;

  @ForeignKey(() => Users)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  user_id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password!: string;

  @CreatedAt
  @Column({ field: "createdAt" })
  createdAt!: Date;

  @UpdatedAt
  @Column({ field: "updatedAt" })
  updatedAt!: Date;
}
