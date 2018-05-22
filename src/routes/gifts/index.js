const express = require('express');
const authenticateJwt = require('../../middleware/authenticate-jwt');

const {
  getGift,
  getGifts
} = require('./get');

const { createGift } = require('./post');
const { deleteGift } = require('./delete');
const { updateGift } = require('./patch');

const router = express.Router();
router.use(authenticateJwt);
router.route('/gifts')
  .get(getGifts)
  .post(createGift)
router.route('/gifts/:giftId')
  .get(getGift)
  .delete(deleteGift)
  .patch(updateGift);

module.exports = {
  router
};
