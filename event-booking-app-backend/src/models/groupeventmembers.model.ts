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
import { GroupEvents } from "./group-events.model";
import { Users } from "./users.model";

@Table({ tableName: "GroupEventMembers", timestamps: false })
export class GroupEventMembers extends Model<GroupEventMembers> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
  })
  group_event_members_id!: string;

  @ForeignKey(() => GroupEvents)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  group_id!: number;

  @ForeignKey(() => Users)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  user_id!: string;

  @BelongsTo(() => Users)
  user!: Users;

  @BelongsTo(()=>GroupEvents)
  groupEvent!: GroupEvents
}
