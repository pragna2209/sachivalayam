/**
 * Integration tests that exercise the complaint lifecycle against a REAL
 * MongoDB connection (not mocked). These are skipped automatically unless
 * INTEGRATION_TEST_MONGODB_URI is set, because this sandbox environment
 * has no outbound access to MongoDB Atlas or a local mongod binary to
 * verify against. In CI/Render/local dev with real MongoDB access, set:
 *
 *   INTEGRATION_TEST_MONGODB_URI=mongodb://127.0.0.1:27017/sachivalayam_test
 *
 * and run: npx jest src/tests/integration
 *
 * This suite is the natural place to add further end-to-end coverage
 * (assignment engine + auto-routing, escalation sweep firing records,
 * reopen-window expiry) once a real database is available to the runner.
 */
const mongoose = require('mongoose');

const INTEGRATION_URI = process.env.INTEGRATION_TEST_MONGODB_URI;
const describeOrSkip = INTEGRATION_URI ? describe : describe.skip;

describeOrSkip('Complaint lifecycle (integration, real MongoDB)', () => {
  let Complaint;
  let Category;
  let Department;
  let User;
  let District;
  let Mandal;
  let Village;
  let Sachivalayam;
  let complaintsService;

  let category;
  let department;
  let citizen;
  let staff;
  let district;
  let mandal;
  let village;
  let sachivalayam;

  beforeAll(async () => {
    await mongoose.connect(INTEGRATION_URI);

    Complaint = require('../../modules/complaints/complaints.model');
    Category = require('../../modules/categories/categories.model');
    Department = require('../../modules/departments/departments.model');
    User = require('../../modules/users/users.model');
    const geoModels = require('../../modules/geo/geo.model');
    District = geoModels.District;
    Mandal = geoModels.Mandal;
    Village = geoModels.Village;
    Sachivalayam = geoModels.Sachivalayam;
    complaintsService = require('../../modules/complaints/complaints.service');

    district = await District.create({ code: 'TST-D', name: { te: 'జ', en: 'TestDistrict', hi: 'ज' } });
    mandal = await Mandal.create({ code: 'TST-M', parentId: district._id, name: { te: 'మ', en: 'TestMandal', hi: 'म' } });
    village = await Village.create({ code: 'TST-V', parentId: mandal._id, name: { te: 'గ', en: 'TestVillage', hi: 'ग' } });
    sachivalayam = await Sachivalayam.create({ code: 'TST-S', parentId: village._id, name: { te: 'స', en: 'TestSachivalayam', hi: 'स' } });

    department = await Department.create({
      name: { te: 'శాఖ', en: 'Test Department', hi: 'विभाग' },
      description: { te: 'వివరణ', en: 'Test', hi: 'विवरण' }
    });

    category = await Category.create({
      code: 'OTHER',
      name: { te: 'ఇతరం', en: 'Other', hi: 'अन्य' },
      isSensitive: false,
      defaultDepartmentId: department._id
    });

    citizen = await User.create({
      role: 'CITIZEN',
      phoneNumber: '9000000001',
      name: 'Test Citizen',
      address: { line1: 'Test', pincode: '500001', districtId: district._id, mandalId: mandal._id, villageId: village._id, sachivalayamId: sachivalayam._id }
    });

    staff = await User.create({
      role: 'SACHIVALAYAM_STAFF',
      phoneNumber: '9000000002',
      name: 'Test Staff',
      jurisdiction: { districtId: district._id, mandalId: mandal._id, sachivalayamId: sachivalayam._id, departmentId: department._id }
    });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  it('creates a complaint and auto-assigns it to the mapped staff member', async () => {
    const complaint = await complaintsService.createComplaint({
      citizenId: citizen._id,
      payload: {
        title: 'Test streetlight complaint',
        description: 'The streetlight has been broken for several days now.',
        categoryId: category._id.toString(),
        address: { line1: 'Near the test location', pincode: '500001' },
        gpsLocation: { coordinates: [78.4, 17.4] },
        districtId: district._id.toString(),
        mandalId: mandal._id.toString(),
        villageId: village._id.toString(),
        sachivalayamId: sachivalayam._id.toString()
      }
    });

    expect(complaint.status).toBe('ASSIGNED');
    expect(complaint.assignedTo.toString()).toBe(staff._id.toString());
    expect(complaint.timeline.length).toBe(2);
    expect(complaint.timeline[0].status).toBe('REGISTERED');
    expect(complaint.timeline[1].status).toBe('ASSIGNED');
  });

  it('progresses a complaint through the full lifecycle and sets reopenDeadline on resolution', async () => {
    const complaint = await complaintsService.createComplaint({
      citizenId: citizen._id,
      payload: {
        title: 'Second test complaint',
        description: 'Another complaint to exercise the full lifecycle transitions.',
        categoryId: category._id.toString(),
        address: { line1: 'Near the test location', pincode: '500001' },
        gpsLocation: { coordinates: [78.4, 17.4] },
        districtId: district._id.toString(),
        mandalId: mandal._id.toString(),
        villageId: village._id.toString(),
        sachivalayamId: sachivalayam._id.toString()
      }
    });

    const jurisdictionFilter = {};
    const actor = { _id: staff._id, role: 'SACHIVALAYAM_STAFF' };

    await complaintsService.updateStatus({
      id: complaint._id, jurisdictionFilter, actor, status: 'UNDER_INVESTIGATION', remark: 'Investigating'
    });
    await complaintsService.updateStatus({
      id: complaint._id, jurisdictionFilter, actor, status: 'ACTION_TAKEN', remark: 'Fixed the light'
    });
    const { complaint: resolved } = await complaintsService.updateStatus({
      id: complaint._id, jurisdictionFilter, actor, status: 'RESOLVED', remark: 'Resolved successfully'
    });

    expect(resolved.status).toBe('RESOLVED');
    expect(resolved.resolvedAt).not.toBeNull();
    expect(resolved.reopenDeadline).not.toBeNull();
    expect(resolved.reopenDeadline.getTime()).toBeGreaterThan(Date.now());
  });
});
