'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
    );
    await queryInterface.createTable('Payments', {
      payment_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
      },
      booking_id:{
        type:Sequelize.UUID,
        allowNull:true
      },
      user_id:{
        type:Sequelize.UUID,
        allowNull:true
      },
      status:{
        type:Sequelize.ENUM("pending", "paid"),
        allowNull:false,
        default:"pending"
      },
      amount:{
        type:Sequelize.DECIMAL(10,2)
      }
    });

    await queryInterface.addConstraint('Payments',{
      fields:['booking_id'],
      type:"foreign key",
      name:"fk_booked_payment",
      references:{
        table:"Bookings",
        field:"booking_id"
      },
      onUpdate:"CASCADE",
      onDelete:"SET NULL"
    })

    await queryInterface.addConstraint('Payments',{
      fields:['user_id'],
      type:"foreign key",
      name:"fk_user_payment",
      references:{
        table:"Users",
        field:"user_id"
      },
      onUpdate:"CASCADE",
      onDelete:"SET NULL"
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Payments');
  }
};