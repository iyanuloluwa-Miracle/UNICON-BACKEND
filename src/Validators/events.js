const Joi = require("joi");

const eventSchema = Joi.object({
  name: Joi.string().required(),
  image: Joi.string().uri().required(),
  eventType: Joi.string().valid("virtual", "physical").required(),
  description: Joi.string().required(),
  location: Joi.string().required(),
  ticketPrice: Joi.number().required(),
  availableTickets: Joi.number().required(),
  registrationClosingDate: Joi.date().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  startTime: Joi.string().required(),
  endTime: Joi.string().required(),
  tags: Joi.array().items(Joi.string()),
});

const registerEventSchema = Joi.object({
  customerName: Joi.string().required(),
  email: Joi.string().email().required(),
  amount: Joi.number().required(),
  initiateType: Joi.string().default("inline"),
  currency: Joi.string().required().valid("NGN"),
  callbackUrl: Joi.string().required(),
});

module.exports = {
  validateEvent: (req, res, next) => {
    const { error } = eventSchema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Validation Error",
          details: error.details[0].message,
        },
        data: null,
      });
    }

    next();
  },
  registerEventSchema,
};
