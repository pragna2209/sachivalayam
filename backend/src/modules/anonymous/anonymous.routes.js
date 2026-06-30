const express = require('express');
const anonymousController = require('./anonymous.controller');
const validate = require('../../middlewares/validate.middleware');
const { anonymousLimiter } = require('../../middlewares/rateLimiter.middleware');
const { createAnonymousComplaintSchema, trackAnonymousComplaintSchema } = require('./anonymous.validation');

const router = express.Router();

router.post(
  '/complaints',
  anonymousLimiter,
  validate({ body: createAnonymousComplaintSchema }),
  anonymousController.create
);

router.post(
  '/track',
  anonymousLimiter,
  validate({ body: trackAnonymousComplaintSchema }),
  anonymousController.track
);

module.exports = router;
