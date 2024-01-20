// controllers/eventController.js
require("../Models/mongoose");
const Event = require("../Models/events");
const { Axios } = require("./../Utils/axiosInstance");
const { registerEventSchema } = require("./../Validators/events");
const crypto = require("crypto");

// Create a new event
const createEvent = async (req, res) => {
  try {
    // userId is stored in req.user

    // Create a new event
    console.log(req.body);
    const event = new Event(req.body);

    // Save the event to the database
    await event.save();

    res.status(201).json({
      success: true,
      data: event,
      message: "Event created successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      success: false,
      data: null,
      error: err.message,
      message: "Event creation failed",
    });
  }
};

// Get all events
const getAllEvents = async (req, res) => {
  try {
    // Fetch all events from the database
    const events = await Event.find().populate("creator", "username email");

    res.status(200).json({
      success: true,
      data: events,
      message: "Events retrieved successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
      message: "Internal Server Error",
    });
  }
};

// Get a specific event by ID
const getEventById = async (req, res) => {
  try {
    const eventId = req.params.id;

    // Find the event by ID
    const event = await Event.findById(eventId).populate(
      "creator",
      "username email"
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      data: event,
      message: "Event retrieved successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
      message: "Internal Server Error",
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
    }).populate("creator", "username email");

    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedEvent,
      message: "Event updated successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      success: false,
      data: null,
      error: err.message,
      message: "Event update failed",
    });
  }
};

// Delete a specific event by ID
const deleteEventById = async (req, res) => {
  try {
    const eventId = req.params.id;

    // Delete the event by ID
    const deletedEvent = await Event.findByIdAndDelete(eventId).populate(
      "creator",
      "username email"
    );

    if (!deletedEvent) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      data: deletedEvent,
      message: "Event deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
      message: "Internal Server Error",
    });
  }
};

const searchAndFilterEvents = async (req, res) => {
  try {
    // Extract parameters from query
    const { search, location, date } = req.query;

    // Create a filter object based on provided parameters
    const filters = {};
    if (location) filters.location = location;
    if (date) filters.startDate = { $gte: new Date(date) };

    // Build the main query
    let mainQuery = {};
    if (search) {
      mainQuery = {
        $or: [
          { name: { $regex: new RegExp(search, "i") } },
          { description: { $regex: new RegExp(search, "i") } },
        ],
      };
    }

    // Combine the main query and filters
    const finalQuery = { ...mainQuery, ...filters };

    // Fetch events from the database based on the combined query
    const events = await Event.find(finalQuery).populate(
      "creator",
      "username email"
    );

    res.status(200).json({
      success: true,
      data: events,
      message: "Search and filter results retrieved successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
      message: "Internal Server Error",
    });
  }
};

const register = async (req, res) => {
  try {
    const { error, value } = registerEventSchema.validate(req.body);
    if (error)
      return res.status(400).json({
        success: false,
        data: null,
        message: error.details[0].message,
      });

    const { customerName, email, amount, initiateType, currency, callbackUrl } =
      value;
    // Multiply the amount by 100
    const amountInKobo = amount * 100;

    const dataToSend = {
      email,
      amount: amountInKobo,
      initiate_type: initiateType,
      currency,
      customer_name: customerName,
      callback_url: callbackUrl,
    };

    const squadResponse = await Axios.post("/transaction/initiate", dataToSend);

    if (squadResponse.status !== 200)
      return res.status(400).json({
        success: false,
        error: squadResponse.data?.message,
      });

    return res.status(200).json({
      success: true,
      message: "Transaction initiated successfully",
      data: squadResponse.data?.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
      message: "Internal Server Error",
    });
  }
};

const receiveWebhook = async (req, res) => {
  const SQUAD_SECRET = process.env.SQUAD_PRIVATE_KEY;
  const hash = crypto
    .createHmac("sha512", SQUAD_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex")
    .toUpperCase();
  if (hash == req.headers["x-squad-encrypted-body"]) {
    console.log("Webhook received successfully");
    console.log(req.body);
    const squadHash = req.headers["x-squad-encrypted-body"];
    return res.status(200).json({
      succes: true,
      message: "Webhook received successfully",
    });
  } else {
    return res.status(400).json({
      succes: false,
      message: "Invalid Webhook received successfully",
    });
  }
};




// Get events by user ID
const getEventsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find events by user ID
    const events = await Event.find({ creator: userId }).populate('creator', 'username email');

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
module.exports = {
  getEventsByUserId,
  createEvent,
  getAllEvents,
  getEventById,
  updateEventById,
  deleteEventById,
  searchAndFilterEvents,
  register,
  receiveWebhook,
};
