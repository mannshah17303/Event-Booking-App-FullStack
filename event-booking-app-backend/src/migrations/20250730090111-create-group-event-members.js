"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
    );
    await queryInterface.createTable("GroupEventMembers", {
      group_event_members_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
      },
      group_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
    });
    await queryInterface.addConstraint("GroupEventMembers",{
      fields:["group_id", "user_id"],
      type:"unique",
      name:"unique_groupEvent_members"
    })
    await queryInterface.addConstraint("GroupEventMembers", {
      fields: ["group_id"],
      type: "foreign key",
      name: "fk_group_event",
      references: {
        table: "GroupEvents",
        field: "group_id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addConstraint("GroupEventMembers", {
      fields: ["user_id"],
      type: "foreign key",
      name: "fk_group_event_members",
      references: {
        table: "Users",
        field: "user_id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("GroupEventMembers");
  },
};
