const express = require("express");
const {
  notFoundHandler,
  errorHandler,
} = require("./src/Middleware/errorHandler");
const morgan = require("morgan");
require("dotenv").config();
const corsOptions = {
  origin: (origin, callback) => {
    // Check if the origin matches any of the patterns
    if (
      !origin ||
      allowedOriginPatterns.some((pattern) => pattern.test(origin))
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

// Middlewares
const allowedOriginPatterns = [
  /http:\/\/localhost:3000$/,
  /http:\/\/localhost:2800$/,
  /^https:\/\/getunicon\.vercel\.app/,
];



const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));




app.get("/", async (req, res, next) => {
  res.send({ message: "Welcome to Squado 🐻" });
});

app.use("/api/v1/", require("./src/Routes/auth.route"));
app.use("/api/v1/", require("./src/Routes/event.route"));
app.use("/api/v1/", require("./src/Routes/user.route"));
// Middleware to generate 404 error for undefined routes
app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));
