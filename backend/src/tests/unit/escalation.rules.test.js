jest.mock('../../config/env', () => ({
  ESCALATION_ASSIGNMENT_BREACH_DAYS: 2,
  ESCALATION_MANDAL_LEVEL1_DAYS: 7,
  ESCALATION_DISTRICT_LEVEL2_DAYS: 15
}));

const escalationRules = require('../../modules/escalation/escalation.rules');
const { COMPLAINT_STATUS, ESCALATION_LEVEL } = require('../../config/constants');

describe('escalation.rules', () => {
  const NOW = new Date('2026-06-21T00:00:00.000Z');

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('buildAssignmentBreachQuery', () => {
    it('matches REGISTERED, unassigned complaints older than the configured threshold', () => {
      const query = escalationRules.buildAssignmentBreachQuery();
      expect(query.status).toBe(COMPLAINT_STATUS.REGISTERED);
      expect(query.assignedTo).toBeNull();
      expect(query['escalations.level']).toEqual({ $ne: ESCALATION_LEVEL.ASSIGNMENT_BREACH });

      const expectedCutoff = new Date(NOW.getTime() - 2 * 24 * 60 * 60 * 1000);
      expect(query.createdAt.$lt.getTime()).toBe(expectedCutoff.getTime());
    });
  });

  describe('buildMandalLevel1Query', () => {
    it('excludes RESOLVED/CLOSED and matches the 7-day threshold', () => {
      const query = escalationRules.buildMandalLevel1Query();
      expect(query.status.$nin).toEqual([COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.CLOSED]);
      expect(query['escalations.level']).toEqual({ $ne: ESCALATION_LEVEL.MANDAL_LEVEL_1 });

      const expectedCutoff = new Date(NOW.getTime() - 7 * 24 * 60 * 60 * 1000);
      expect(query.createdAt.$lt.getTime()).toBe(expectedCutoff.getTime());
    });
  });

  describe('buildDistrictLevel2Query', () => {
    it('excludes RESOLVED/CLOSED and matches the 15-day threshold', () => {
      const query = escalationRules.buildDistrictLevel2Query();
      expect(query.status.$nin).toEqual([COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.CLOSED]);
      expect(query['escalations.level']).toEqual({ $ne: ESCALATION_LEVEL.DISTRICT_LEVEL_2 });

      const expectedCutoff = new Date(NOW.getTime() - 15 * 24 * 60 * 60 * 1000);
      expect(query.createdAt.$lt.getTime()).toBe(expectedCutoff.getTime());
    });
  });
});
