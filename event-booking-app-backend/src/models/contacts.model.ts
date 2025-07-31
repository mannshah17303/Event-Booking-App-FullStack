import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
} from "sequelize-typescript";

@Table({ tableName: "Contacts", timestamps: false, paranoid: true })
export class Contacts extends Model<Contacts> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
  })
  contact_id!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  phone_number!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  event_name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  message!: string;
}
