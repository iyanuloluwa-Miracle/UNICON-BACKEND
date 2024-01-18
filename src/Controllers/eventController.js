// controllers/eventController.js
require("../Models/mongoose");
const Event = require('../Models/events');

// Create a new event
const createEvent = async (req, res) => {
  try {
    const eventData = { ...req.body, creator: req.user.userId }; // Assuming userId is stored in req.user

    // Create a new event
    const event = new Event(eventData);

    // Save the event to the database
    await event.save();

    res.status(201).json({
      success: true,
      data: event,
      message: 'Event created successfully',
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      success: false,
      data: null,
      error: err.message,
      message: 'Event creation failed',
    });
  }
};

// Get all events
const getAllEvents = async (req, res) => {
  try {
    // Fetch all events from the database
    const events = await Event.find().populate('creator', 'username email');

    res.status(200).json({
      success: true,
      data: events,
      message: 'Events retrieved successfully',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
      message: 'Internal Server Error',
    });
  }
};

// Get a specific event by ID
const getEventById = async (req, res) => {
    try {
      const eventId = req.params.id;
  
      // Find the event by ID
      const event = await Event.findById(eventId).populate('creator', 'username email');
  
      if (!event) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'Event not found',
        });
      }
  
      res.status(200).json({
        success: true,
        data: event,
        message: 'Event retrieved successfully',
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        data: null,
        error: err.message,
        message: 'Internal Server Error',
      });
    }
  };
  
  // Update a specific event by ID
  const updateEventById = async (req, res) => {
    try {
      const eventId = req.params.id;
      const updateData = req.body;
  
      // Update the event by ID
      const updatedEvent = await Event.findByIdAndUpdate(eventId, updateData, {
        new: true, // Return the updated document
        runValidators: true, // Run validation on update
      }).populate('creator', 'username email');
  
      if (!updatedEvent) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'Event not found',
        });
      }
  
      res.status(200).json({
        success: true,
        data: updatedEvent,
        message: 'Event updated successfully',
      });
    } catch (err) {
      console.error(err);
      res.status(400).json({
        success: false,
        data: null,
        error: err.message,
        message: 'Event update failed',
      });
    }
  };
  
  // Delete a specific event by ID
  const deleteEventById = async (req, res) => {
    try {
      const eventId = req.params.id;
  
      // Delete the event by ID
      const deletedEvent = await Event.findByIdAndDelete(eventId).populate('creator', 'username email');
  
      if (!deletedEvent) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'Event not found',
        });
      }
  
      res.status(200).json({
        success: true,
        data: deletedEvent,
        message: 'Event deleted successfully',
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        data: null,
        error: err.message,
        message: 'Internal Server Error',
      });
    }
};

module.exports = {
    createEvent,
    getAllEvents,
    getEventById,
    updateEventById,
    deleteEventById,
};
  
