const axios = require("axios");

const SQUAD_PRIVATE_KEY = process.env.SQUAD_PRIVATE_KEY;
const SQUAD_BASE_URL = process.env.SQUAD_BASE_URL;

const Axios = axios.create({
  baseURL: SQUAD_BASE_URL,
  headers: {
    Authorization: `Bearer ${SQUAD_PRIVATE_KEY}`,
  },
});

module.exports = {
  Axios,
};
