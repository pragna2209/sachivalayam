const { ROLES } = require('../config/constants');

/**
 * Injects a MongoDB filter object (req.jurisdictionFilter) constraining
 * any subsequent query to the caller's own data/jurisdiction, BEFORE the
 * controller ever runs. This is the architecture's defense-in-depth layer:
 * even if a controller forgets to apply scoping itself, the filter object
 * it receives is already pre-narrowed.
 *
 * Controllers MUST merge req.jurisdictionFilter into their Mongo query -
 * this middleware only prepares the filter, it does not run the query.
 * The complaints service additionally re-checks ownership/jurisdiction at
 * the data-access layer as a second independent check (Section 9.2).
 */
function scopeToJurisdiction(req, res, next) {
  const { role, jurisdiction, _id } = req.user;

  switch (role) {
    case ROLES.CITIZEN:
      req.jurisdictionFilter = { citizenId: _id };
      break;

    case ROLES.SACHIVALAYAM_STAFF:
      req.jurisdictionFilter = { assignedTo: _id };
      break;

    case ROLES.MANDAL_OFFICER:
      req.jurisdictionFilter = jurisdiction && jurisdiction.mandalId
        ? { mandalId: jurisdiction.mandalId }
        : { _id: null }; // no jurisdiction assigned -> sees nothing, fails safe
      break;

    case ROLES.DISTRICT_OFFICER:
      req.jurisdictionFilter = jurisdiction && jurisdiction.districtId
        ? { districtId: jurisdiction.districtId }
        : { _id: null };
      break;

    case ROLES.ADMIN:
      req.jurisdictionFilter = {}; // unrestricted
      break;

    default:
      req.jurisdictionFilter = { _id: null };
  }

  return next();
}

module.exports = scopeToJurisdiction;
