'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('GroupEvents', {
      group_id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement:true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING
      },
      date: {
        type: Sequelize.DATE
      },
      location: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING,
        allowNull:true
      },
      price: {
        type: Sequelize.DECIMAL(10,2)
      },
      image_url: {
        type: Sequelize.STRING,
        allowNull:true
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('GroupEvents');
  }
};