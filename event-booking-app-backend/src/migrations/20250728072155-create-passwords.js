'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
    );
    await queryInterface.createTable('Passwords', {
      password_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
      },
      user_id:{
        type:Sequelize.UUID,
        allowNull:true
      },
      password:{
        type:Sequelize.STRING,
        allowNull:false
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

    await queryInterface.addConstraint('Passwords',{
      fields:['user_id'],
      type:"foreign key",
      name:"fk_user_password",
      references:{
        table:"Users",
        field:"user_id"
      },
      onUpdate:"CASCADE",
      onDelete:"SET NULL"
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Passwords');
  }
};