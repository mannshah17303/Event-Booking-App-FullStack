"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
    );
    await queryInterface.createTable("Favorites", {
   
      favorite_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
      },

      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      event_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    });

    await queryInterface.addConstraint("Favorites", {
      fields: ["user_id", "event_id"],
      type: "unique",
      name: "unique_user_event_favorite",
    });

    await queryInterface.addConstraint("Favorites",{
      fields:["user_id"],
      type:"foreign key",
      name:"fk_favorites_user",
      references:{
        table:"Users",
        field:"user_id"
      },
      onUpdate:"CASCADE",
      onDelete:"SET NULL"
    })

    await queryInterface.addConstraint("Favorites",{
      fields:["event_id"],
      type:"foreign key",
      name:"fk_favorites_events",
      references:{
        table:"Events",
        field:"event_id"
      },
      onUpdate:"CASCADE",
      onDelete:"SET NULL"
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Favorites");
  },
};
