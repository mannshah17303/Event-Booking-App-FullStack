'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    return queryInterface.bulkInsert("GroupEvents", [
      {
        group_id: 1,
        name: "Live Music Concert: Arijit Singh",
        date: "2025-07-31",
        location: "JLN Stadium, Delhi",
        description:
          "Experience an unforgettable night with Arijit Singh's soulful live performance under the stars.",
        price: 500,
        image_url: "/concert_arijit.jpg",
      },
      {
        group_id: 2,
        name: "Stand-Up Comedy Night: Zakir Khan",
        date: "2025-08-01",
        location: "Phoenix Marketcity, Bangalore",
        description:
          "Laugh your heart out with Zakir Khan’s relatable humor and iconic punchlines.",
        price: 120,
        image_url: "/comedy_zakir.jpg",
      },
      {
        group_id: 3,
        name: "EDM Night with DJ Snake",
        date: "2025-08-03",
        location: "NSCI Dome, Mumbai",
        description:
          "Dance the night away to electrifying beats at this high-energy EDM event featuring DJ Snake.",
        price: 350,
        image_url: "/edm_djsnake.jpg",
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    queryInterface.bulkDelete("GroupEvents", null, {});
  }
};
