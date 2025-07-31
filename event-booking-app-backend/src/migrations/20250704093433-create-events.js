'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Events', {
      event_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      event_title: {
        type: Sequelize.STRING
      },
      event_date: {
        type: Sequelize.DATE
      },
      event_location: {
        type: Sequelize.STRING
      },
      event_description: {
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
      ratings: {
        type: Sequelize.INTEGER,
        validate:{
          min:0,
          max:5
        }
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Events');
  }
};