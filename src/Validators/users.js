const Joi = require("joi");

const userFindByIdRequestSchema = Joi.object({
  id: Joi.string().required(),
});

const searchUserRequestSchema = Joi.object({
  searchTerm: Joi.string().required(),
});

const updateUserRequestSchema = Joi.object({
  name: Joi.string().max(50),
  username: Joi.string().max(20),
  bio: Joi.string().max(500),
  email: Joi.string().email(),
  location: Joi.string().max(50),
  profilePicture: Joi.string(),
});

const updateUserRequestSchema2 = Joi.object({
    id: Joi.string().required(),
});


const deleteUserRequestSchema = Joi.object({
    id: Joi.string().required()
});


module.exports = {
  userFindByIdRequestSchema,
  searchUserRequestSchema,
  updateUserRequestSchema,
  updateUserRequestSchema2,
  deleteUserRequestSchema,
};
