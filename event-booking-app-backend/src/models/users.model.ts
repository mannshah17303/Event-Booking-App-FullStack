import { Op, Sequelize } from "sequelize";
import {
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  Default,
  DeletedAt,
  HasMany,
  Model,
  PrimaryKey,
  Scopes,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import { Bookings } from "./bookings.model";
import { Events } from "./events.model";
import { Favorites } from "./favorites.model";
import { Tickets } from "./tickets.model";

@Scopes(() => ({
  admins: {
    where: {
      role: "admin",
    },
  },
  // one to many relationship(included favorites events and tickets also)
  withBookings: {
    attributes: ["user_id", "name", "email"],
    include: [
      {
        model: Bookings,
        attributes: ["booking_id", "booking_date", "ratings", "event_id"],
        include: [
          {
            model: Events,
            attributes: [
              "event_id",
              "event_title",
              "price",
              "ratings",
              "event_description",
              "image_url",
              "event_date",
              "event_location",
            ],
          },
          {
            model: Tickets,
            attributes: [
              "ticket_id",
              "quantity",
              "total_amount",
              "purchase_date",
            ],
          },
        ],
      },
      {
        model: Favorites,
        attributes: ["favorite_id"],
        include: [
          {
            model: Events,
            attributes: [
              "event_id",
              "event_title",
              "price",
              "ratings",
              "event_description",
              "image_url",
              "event_date",
              "event_location",
            ],
          },
        ],
      },
    ],
  },
  //many to many relationship(one user can favorite many events. one event can be favorited by many users)
  favoritesWithEvents: {
    attributes: ["user_id", "name", "email"],
    include: [
      {
        model: Events,
        attributes: ["event_id", "event_title", "price", "ratings"],
        through: { attributes: [] },
        as: "favorites",
      },
    ],
  },
  nameStartsWithM: {
    where: {
      name: {
        [Op.like]: "M%",
      },
    },
    order: [["name", "ASC"]],
  },
  numberOfBookingsPerUser: {
    attributes: [
      "user_id",
      "name",
      [
        Sequelize.literal(
          `(select count(1) from "Bookings" as b where b."user_id" = "Users"."user_id")`
        ),
        "bookingCount",
      ],
    ],
  },
  averageRatingsPerEvents: {
    include: [
      {
        model: Favorites,
        attributes: ["event_id"],
      },
    ],
    attributes: [
      "name",
      [
        Sequelize.literal(
          `(select round(avg(e."ratings"),2) from "Events" e join "Favorites" f on e."event_id" = f."event_id" where f.user_id = "Users"."user_id")`
        ),
        "avg_ratings",
      ],
    ],
  },
  getTheDeletedDataUsingParanoidTrue: {
    where: {
      deletedAt: { [Op.ne]: null },
    },
    paranoid: false,
  },
}))
@Table({ tableName: "Users", timestamps: true, paranoid: true })
export class Users extends Model<Users> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
  })
  user_id!: string;

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
    type: DataType.ENUM("admin", "user"),
    allowNull: false,
    defaultValue: "admin",
  })
  role!: string;

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

  @DeletedAt
  @Column({ field: "deletedAt" })
  deletedAt!: Date;

  //one user can book many events
  @HasMany(() => Bookings)
  bookings!: Bookings[];

  @HasMany(() => Favorites)
  favoriteEvents!: Favorites;

  //one user can favorite many events. one event can be favorited by many users
  @BelongsToMany(() => Events, () => Favorites)
  favorites!: Events[];
}
