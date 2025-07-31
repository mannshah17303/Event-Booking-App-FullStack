'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
    );
    await queryInterface.createTable('Tickets', {
      ticket_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
      },
      
      booking_id:{
        type:Sequelize.UUID,
        allowNull:true,
      },
      quantity:{
        type:Sequelize.INTEGER,
        allowNull:false,
      },
      price_per_ticket:{
        type:Sequelize.DECIMAL(10,2),
        allowNull:false
      },
      total_amount:{
        type:Sequelize.DECIMAL(10,2),
        allowNull:true
      },
      purchase_date: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue:Sequelize.NOW
      },
    });
    await queryInterface.addConstraint('Tickets', {
      fields: ['booking_id'],
      type: 'unique',
      name: 'unique_booking_ticket'
    }); 

    await queryInterface.addConstraint("Tickets",{
      fields:["booking_id"],
      type:"foreign key",
      name:"fk_ticket_booking",
      references:{
        table:"Bookings",
        field:"booking_id"
      },
      onUpdate:"CASCADE",
      onDelete:"SET NULL"
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Tickets');
  }
};