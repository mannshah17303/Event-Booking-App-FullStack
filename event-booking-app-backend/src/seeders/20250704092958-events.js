"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("Events", [
      {
        event_id: 1,
        event_title: "Traditional Wedding Ceremony",
        event_date: "2025-07-28",
        event_location: "Lake Palace, Udaipur",
        event_description:
          "A grand traditional Indian wedding with vibrant rituals, music, dance, and exquisite cuisine.",
        price: 150000,
        image_url: "/wedding.jpg",
        ratings: 5,
      },
      {
        event_id: 2,
        event_title: "Engagement Party",
        event_date: "2025-07-29",
        event_location: "Taj Mahal Palace, Mumbai",
        event_description:
          "Celebrate the joyful union with close family and friends in a luxurious engagement party.",
        price: 75000,
        image_url: "/engagement.jpg",
        ratings: 2,
      },
      {
        event_id: 3,
        event_title: "Sangeet Night",
        event_date: "2025-07-30",
        event_location: "Royal Orchid Resort, Bangalore",
        event_description:
          "An evening full of music, dance performances, and colorful celebrations before the wedding day.",
        price: 50000,
        image_url: "/sangeet.webp",
        ratings: 3,
      },
      {
        event_id: 4,
        event_title: "Mehndi Ceremony",
        event_date: "2025-07-31",
        event_location: "ITC Grand Chola, Chennai",
        event_description:
          "Traditional Mehndi ceremony with henna application, folk songs, and vibrant décor.",
        price: 40000,
        image_url: "/mehendi.jpeg",
        ratings: 4,
      },
      {
        event_id: 5,
        event_title: "Reception Dinner",
        event_date: "2025-08-01",
        event_location: "The Oberoi, Delhi",
        event_description:
          "A formal reception dinner to welcome guests with fine dining and cultural performances.",
        price: 120000,
        image_url: "/reception.jpeg",
        ratings: 5,
      },
      {
        event_id: 6,
        event_title: "Haldi Ceremony",
        event_date: "2025-08-02",
        event_location: "Leela Palace, Hyderabad",
        event_description:
          "A joyful ceremony where turmeric paste is applied to bride and groom with fun rituals and music.",
        price: 35000,
        image_url: "/haldi.jpg",
        ratings: 5,
      },
      {
        event_id: 7,
        event_title: "Pre-Wedding Photoshoot",
        event_date: "2025-08-03",
        event_location: "Udaipur City Palace, Udaipur",
        event_description:
          "A romantic pre-wedding photoshoot in picturesque locations celebrating the couple’s journey.",
        price: 20000,
        image_url: "/prewedding.webp",
        ratings: 1,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    queryInterface.bulkDelete("Events", null, {});
  },
};
