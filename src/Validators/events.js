const Joi = require('joi');

const eventSchema = Joi.object({
  name: Joi.string().required(),
  image: Joi.string().uri().required(),
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

module.exports = {
  validateEvent: (req, res, next) => {
    const { error } = eventSchema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation Error',
          details: error.details.map((detail) => detail.message),
        },
        data: null,
      });
    }

    next();
  },
};
