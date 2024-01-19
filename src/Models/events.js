// models/event.js
const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  eventType: {
    type: String,
    enum: ["virtual", "physical"],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  ticketPrice: {
    type: Number,
    required: true,
  },
  availableTickets: {
    type: Number,
    required: true,
  },
  registrationClosingDate: {
    type: Date,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
