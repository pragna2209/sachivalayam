const { createComplaintSchema, updateStatusSchema, feedbackSchema } = require('../../modules/complaints/complaints.validation');
const { requestOtpSchema, verifyOtpSchema } = require('../../modules/auth/auth.validation');

describe('complaints.validation', () => {
  const validPayload = {
    title: 'Streetlight not working',
    description: 'The streetlight near the bus stop has been off for a week.',
    categoryId: '64a1b2c3d4e5f6a7b8c9d0e1',
    address: { line1: 'Near bus stop', pincode: '518001' },
    gpsLocation: { coordinates: [78.123, 15.456] },
    districtId: '64a1b2c3d4e5f6a7b8c9d0e2',
    mandalId: '64a1b2c3d4e5f6a7b8c9d0e3',
    villageId: '64a1b2c3d4e5f6a7b8c9d0e4',
    sachivalayamId: '64a1b2c3d4e5f6a7b8c9d0e5'
  };

  it('accepts a fully valid complaint payload', () => {
    const result = createComplaintSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('rejects a title shorter than 5 characters', () => {
    const result = createComplaintSchema.safeParse({ ...validPayload, title: 'Hi' });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid pincode', () => {
    const result = createComplaintSchema.safeParse({
      ...validPayload,
      address: { ...validPayload.address, pincode: '123' }
    });
    expect(result.success).toBe(false);
  });

  it('rejects gpsLocation with only one coordinate', () => {
    const result = createComplaintSchema.safeParse({
      ...validPayload,
      gpsLocation: { coordinates: [78.123] }
    });
    expect(result.success).toBe(false);
  });

  it('rejects a missing categoryId', () => {
    const { categoryId, ...withoutCategory } = validPayload;
    const result = createComplaintSchema.safeParse(withoutCategory);
    expect(result.success).toBe(false);
  });

  it('updateStatusSchema requires a non-empty remark', () => {
    const result = updateStatusSchema.safeParse({ status: 'ASSIGNED', remark: '' });
    expect(result.success).toBe(false);
  });

  it('feedbackSchema rejects rating outside 1-5', () => {
    expect(feedbackSchema.safeParse({ rating: 0 }).success).toBe(false);
    expect(feedbackSchema.safeParse({ rating: 6 }).success).toBe(false);
    expect(feedbackSchema.safeParse({ rating: 3 }).success).toBe(true);
  });
});

describe('auth.validation', () => {
  it('requestOtpSchema rejects a phone number that is not 10 digits', () => {
    expect(requestOtpSchema.safeParse({ phoneNumber: '12345', purpose: 'LOGIN' }).success).toBe(false);
    expect(requestOtpSchema.safeParse({ phoneNumber: '9876543210', purpose: 'LOGIN' }).success).toBe(true);
  });

  it('requestOtpSchema rejects an invalid purpose', () => {
    const result = requestOtpSchema.safeParse({ phoneNumber: '9876543210', purpose: 'HACK' });
    expect(result.success).toBe(false);
  });

  it('verifyOtpSchema accepts a minimal LOGIN payload', () => {
    const result = verifyOtpSchema.safeParse({ phoneNumber: '9876543210', otp: '123456', purpose: 'LOGIN' });
    expect(result.success).toBe(true);
  });

  it('verifyOtpSchema rejects a non-numeric OTP', () => {
    const result = verifyOtpSchema.safeParse({ phoneNumber: '9876543210', otp: 'abcdef', purpose: 'LOGIN' });
    expect(result.success).toBe(false);
  });
});
