const express = require("express");
const cors = require('cors');
const {
  notFoundHandler,
  errorHandler,
} = require("./src/Middleware/errorHandler");
const morgan = require("morgan");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));

// Apply CORS globally to all routes
app.use(cors());


app.get("/", async (req, res, next) => {
  res.send({ message: "Welcome to Squado 🐻" });
});

app.use("/api/v1/", require("./src/Routes/auth.route"));
app.use("/api/v1/", require("./src/Routes/event.route"));

// Middleware to generate 404 error for undefined routes
app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));
