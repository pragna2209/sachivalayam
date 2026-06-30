const bcrypt = require('bcryptjs');
const AnonymousComplainantCredentials = require('./anonymous.model');
const Complaint = require('../complaints/complaints.model');
const complaintsService = require('../complaints/complaints.service');
const Category = require('../categories/categories.model');
const { generateTrackingId } = require('../../utils/generateTrackingId');
const { BadRequestError, UnauthorizedError, NotFoundError } = require('../../utils/appError');

const SALT_ROUNDS = 10;

/**
 * Creates an anonymous complaint. Restricted at the service layer (not
 * just documented) to the 5 sensitive categories - this is enforced again
 * here even though complaints.service.js also checks isSensitive, because
 * the credential record (trackingId + PIN) must only ever be created for
 * a complaint that actually passed that check.
 */
async function createAnonymousComplaint(payload) {
  const category = await Category.findById(payload.categoryId).lean();
  if (!category) {
    throw new BadRequestError('Invalid category');
  }
  if (!category.isSensitive) {
    throw new BadRequestError('anonymous.categoryNotAllowed');
  }

  const trackingId = generateTrackingId();
  const pinHash = await bcrypt.hash(payload.pin, SALT_ROUNDS);

  await AnonymousComplainantCredentials.create({
    trackingId,
    pinHash,
    optionalContactChannel: payload.optionalContactChannel || {}
  });

  const complaint = await complaintsService.createAnonymousComplaint({ trackingId, payload });

  return { trackingId, complaint };
}

/**
 * Looks up an anonymous complaint by Tracking ID + PIN. Both must match -
 * this is the sole authentication mechanism for anonymous complainants,
 * rate-limited identically to OTP at the route layer (Section 9.1).
 */
async function trackAnonymousComplaint({ trackingId, pin }) {
  const credentials = await AnonymousComplainantCredentials.findOne({ trackingId });
  if (!credentials) {
    throw new UnauthorizedError('anonymous.invalidCredentials');
  }

  const isMatch = await bcrypt.compare(pin, credentials.pinHash);
  if (!isMatch) {
    throw new UnauthorizedError('anonymous.invalidCredentials');
  }

  const complaint = await Complaint.findOne({ anonymousTrackingId: trackingId })
    .populate('categoryId', 'name code')
    .populate('departmentId', 'name')
    .lean();

  if (!complaint) {
    throw new NotFoundError('complaint.notFound');
  }

  return complaint;
}

module.exports = { createAnonymousComplaint, trackAnonymousComplaint };
