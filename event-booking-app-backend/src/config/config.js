require("dotenv").config();
module.exports = {
  development: {
    username: "postgres",
    password: "mann17303",
    database: "event_booking_app",
    host: "localhost",
    dialect: "postgres",
  },
  production: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // important for Railway
      },
    },
  },
};
