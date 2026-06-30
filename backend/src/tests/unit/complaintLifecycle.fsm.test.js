const { assertValidTransition, isTerminal, canReopen } = require('../../modules/complaints/complaintLifecycle.fsm');
const { COMPLAINT_STATUS } = require('../../config/constants');

describe('complaintLifecycle.fsm', () => {
  describe('assertValidTransition', () => {
    it('allows REGISTERED -> ASSIGNED', () => {
      expect(() => assertValidTransition(COMPLAINT_STATUS.REGISTERED, COMPLAINT_STATUS.ASSIGNED)).not.toThrow();
    });

    it('allows the full forward lifecycle in order', () => {
      expect(() => assertValidTransition(COMPLAINT_STATUS.ASSIGNED, COMPLAINT_STATUS.UNDER_INVESTIGATION)).not.toThrow();
      expect(() => assertValidTransition(COMPLAINT_STATUS.UNDER_INVESTIGATION, COMPLAINT_STATUS.ACTION_TAKEN)).not.toThrow();
      expect(() => assertValidTransition(COMPLAINT_STATUS.ACTION_TAKEN, COMPLAINT_STATUS.RESOLVED)).not.toThrow();
      expect(() => assertValidTransition(COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.CLOSED)).not.toThrow();
    });

    it('allows RESOLVED -> REOPENED and CLOSED -> REOPENED', () => {
      expect(() => assertValidTransition(COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.REOPENED)).not.toThrow();
      expect(() => assertValidTransition(COMPLAINT_STATUS.CLOSED, COMPLAINT_STATUS.REOPENED)).not.toThrow();
    });

    it('allows REOPENED -> UNDER_INVESTIGATION', () => {
      expect(() => assertValidTransition(COMPLAINT_STATUS.REOPENED, COMPLAINT_STATUS.UNDER_INVESTIGATION)).not.toThrow();
    });

    it('rejects skipping a stage (REGISTERED -> RESOLVED)', () => {
      expect(() => assertValidTransition(COMPLAINT_STATUS.REGISTERED, COMPLAINT_STATUS.RESOLVED)).toThrow();
    });

    it('rejects moving backwards (ACTION_TAKEN -> ASSIGNED)', () => {
      expect(() => assertValidTransition(COMPLAINT_STATUS.ACTION_TAKEN, COMPLAINT_STATUS.ASSIGNED)).toThrow();
    });

    it('rejects transitioning out of CLOSED to anything other than REOPENED', () => {
      expect(() => assertValidTransition(COMPLAINT_STATUS.CLOSED, COMPLAINT_STATUS.RESOLVED)).toThrow();
      expect(() => assertValidTransition(COMPLAINT_STATUS.CLOSED, COMPLAINT_STATUS.ASSIGNED)).toThrow();
    });

    it('rejects an unknown status value', () => {
      expect(() => assertValidTransition(COMPLAINT_STATUS.REGISTERED, 'NOT_A_REAL_STATUS')).toThrow();
    });
  });

  describe('isTerminal', () => {
    it('treats RESOLVED and CLOSED as terminal', () => {
      expect(isTerminal(COMPLAINT_STATUS.RESOLVED)).toBe(true);
      expect(isTerminal(COMPLAINT_STATUS.CLOSED)).toBe(true);
    });

    it('treats all other statuses as non-terminal', () => {
      expect(isTerminal(COMPLAINT_STATUS.REGISTERED)).toBe(false);
      expect(isTerminal(COMPLAINT_STATUS.ASSIGNED)).toBe(false);
      expect(isTerminal(COMPLAINT_STATUS.UNDER_INVESTIGATION)).toBe(false);
      expect(isTerminal(COMPLAINT_STATUS.ACTION_TAKEN)).toBe(false);
      expect(isTerminal(COMPLAINT_STATUS.REOPENED)).toBe(false);
    });
  });

  describe('canReopen', () => {
    it('permits reopening from RESOLVED or CLOSED only', () => {
      expect(canReopen(COMPLAINT_STATUS.RESOLVED)).toBe(true);
      expect(canReopen(COMPLAINT_STATUS.CLOSED)).toBe(true);
      expect(canReopen(COMPLAINT_STATUS.ASSIGNED)).toBe(false);
      expect(canReopen(COMPLAINT_STATUS.REGISTERED)).toBe(false);
    });
  });
});
