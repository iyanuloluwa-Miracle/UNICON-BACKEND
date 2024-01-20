// routes/eventRoutes.js
const express = require("express");
const router = express.Router();
const eventController = require("../Controllers/eventController");
const { verifyToken } = require("../Utils/authUtils");
const { validateEvent } = require("../Validators/events");

// Create a new event
router.post("/events", verifyToken, validateEvent, eventController.createEvent);

router.get("/events/:id", eventController.getEventById);

// User's who don't have an account can also register for events.
router.post("/events/register", eventController.register);

// Get all events
router.get("/events", verifyToken, eventController.getAllEvents);
// Get a specific event by ID

// Update a specific event by ID
router.put(
  "/events/:id",
  verifyToken,
  validateEvent,
  eventController.updateEventById
);

// Delete a specific event by ID
router.delete("/events/:id", verifyToken, eventController.deleteEventById);

// Search and filter events
router.get(
  "/events/search-filter",
  verifyToken,
  eventController.searchAndFilterEvents
);

router.post("/webhook", eventController.receiveWebhook);

module.exports = router;
