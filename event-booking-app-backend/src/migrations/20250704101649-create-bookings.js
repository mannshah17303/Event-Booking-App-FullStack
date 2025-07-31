'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    await queryInterface.createTable('Bookings', {
      
      booking_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("uuid_generate_v4()")
      },

      user_id: {
        type: Sequelize.UUID,
        allowNull:true
      },
      event_id: {
        type: Sequelize.INTEGER,
        allowNull:true
      },
      booking_date: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    await queryInterface.addConstraint("Bookings",{
      fields:["user_id", "event_id"],
      type:"unique",
      name:"unique_user_event_booking"
    })

    await queryInterface.addConstraint("Bookings",{
      fields:["user_id"],
      type:"foreign key",
      name:"fk_booking_user",
      references:{
        table:"Users",
        field:"user_id"
      },
      onUpdate:"CASCADE",
      onDelete:"SET NULL"
    })

    await queryInterface.addConstraint("Bookings",{
      fields:["event_id"],
      type:"foreign key",
      name:"fk_booking_event",
      references:{
        table:"Events",
        field:"event_id"
      },
      onUpdate:"CASCADE",
      onDelete:"SET NULL"
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Bookings');
  }
};