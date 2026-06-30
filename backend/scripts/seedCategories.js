/**
 * Seeds the Department master data and all 21 complaint categories
 * specified in the original requirements (including the 5 sensitive
 * categories eligible for anonymous submission), plus a primary
 * category-department mapping for each. Idempotent on category code.
 */
const { connectDB, disconnectDB } = require('../src/config/db');
const Department = require('../src/modules/departments/departments.model');
const Category = require('../src/modules/categories/categories.model');
const CategoryDepartmentMapping = require('../src/modules/categories/categoryDepartmentMapping.model');
const logger = require('../src/utils/logger');

const DEPARTMENTS = [
  { key: 'MUNICIPAL', name: { te: 'మునిసిపల్ విభాగం', en: 'Municipal Department', hi: 'नगरपालिका विभाग' } },
  { key: 'WATER', name: { te: 'నీటి సరఫరా విభాగం', en: 'Water Supply Department', hi: 'जल आपूर्ति विभाग' } },
  { key: 'HEALTH', name: { te: 'ఆరోగ్య విభాగం', en: 'Health Department', hi: 'स्वास्थ्य विभाग' } },
  { key: 'EDUCATION', name: { te: 'విద్యా విభాగం', en: 'Education Department', hi: 'शिक्षा विभाग' } },
  { key: 'REVENUE', name: { te: 'రెవిన్యూ విభాగం', en: 'Revenue Department', hi: 'राजस्व विभाग' } },
  { key: 'WELFARE', name: { te: 'సంక్షేమ విభాగం', en: 'Welfare Department', hi: 'कल्याण विभाग' } },
  { key: 'AGRICULTURE', name: { te: 'వ్యవసాయ విభాగం', en: 'Agriculture Department', hi: 'कृषि विभाग' } },
  { key: 'HOUSING', name: { te: 'గృహ నిర్మాణ విభాగం', en: 'Housing Department', hi: 'आवास विभाग' } },
  { key: 'ELECTRICITY', name: { te: 'విద్యుత్ విభాగం', en: 'Electricity Department', hi: 'विद्युत विभाग' } },
  { key: 'PDS', name: { te: 'ప్రజా పంపిణీ విభాగం', en: 'Public Distribution Department', hi: 'सार्वजनिक वितरण विभाग' } },
  { key: 'WOMEN_CHILD', name: { te: 'మహిళా శిశు సంక్షేమ విభాగం', en: 'Women & Child Welfare Department', hi: 'महिला एवं बाल कल्याण विभाग' } },
  { key: 'EMPLOYMENT', name: { te: 'ఉద్యోగ విభాగం', en: 'Employment Department', hi: 'रोजगार विभाग' } },
  { key: 'ENVIRONMENT', name: { te: 'పర్యావరణ విభాగం', en: 'Environment Department', hi: 'पर्यावरण विभाग' } },
  { key: 'VIGILANCE', name: { te: 'విజిలెన్స్ విభాగం', en: 'Vigilance Department', hi: 'सतर्कता विभाग' } },
  { key: 'GENERAL', name: { te: 'సాధారణ పరిపాలన విభాగం', en: 'General Administration Department', hi: 'सामान्य प्रशासन विभाग' } }
];

const CATEGORIES = [
  { code: 'MUNICIPAL_SERVICES', dept: 'MUNICIPAL', sensitive: false, name: { te: 'మునిసిపల్ సేవలు', en: 'Municipal Services', hi: 'नगरपालिका सेवाएं' } },
  { code: 'WATER_SUPPLY', dept: 'WATER', sensitive: false, name: { te: 'నీటి సరఫరా', en: 'Water Supply', hi: 'जल आपूर्ति' } },
  { code: 'DRAINAGE', dept: 'MUNICIPAL', sensitive: false, name: { te: 'డ్రైనేజీ', en: 'Drainage', hi: 'जल निकासी' } },
  { code: 'ROADS', dept: 'MUNICIPAL', sensitive: false, name: { te: 'రోడ్లు', en: 'Roads', hi: 'सड़कें' } },
  { code: 'STREET_LIGHTS', dept: 'MUNICIPAL', sensitive: false, name: { te: 'వీధి దీపాలు', en: 'Street Lights', hi: 'स्ट्रीट लाइट' } },
  { code: 'SANITATION', dept: 'MUNICIPAL', sensitive: false, name: { te: 'పారిశుధ్యం', en: 'Sanitation', hi: 'स्वच्छता' } },
  { code: 'HEALTH_SERVICES', dept: 'HEALTH', sensitive: false, name: { te: 'ఆరోగ్య సేవలు', en: 'Health Services', hi: 'स्वास्थ्य सेवाएं' } },
  { code: 'EDUCATION', dept: 'EDUCATION', sensitive: false, name: { te: 'విద్య', en: 'Education', hi: 'शिक्षा' } },
  { code: 'REVENUE_DEPARTMENT', dept: 'REVENUE', sensitive: false, name: { te: 'రెవిన్యూ శాఖ', en: 'Revenue Department', hi: 'राजस्व विभाग' } },
  { code: 'CERTIFICATES', dept: 'REVENUE', sensitive: false, name: { te: 'సర్టిఫికెట్లు', en: 'Certificates', hi: 'प्रमाण पत्र' } },
  { code: 'PENSION_SERVICES', dept: 'WELFARE', sensitive: false, name: { te: 'పెన్షన్ సేవలు', en: 'Pension Services', hi: 'पेंशन सेवाएं' } },
  { code: 'WELFARE_SCHEMES', dept: 'WELFARE', sensitive: false, name: { te: 'సంక్షేమ పథకాలు', en: 'Welfare Schemes', hi: 'कल्याण योजनाएं' } },
  { code: 'AGRICULTURE', dept: 'AGRICULTURE', sensitive: false, name: { te: 'వ్యవసాయం', en: 'Agriculture', hi: 'कृषि' } },
  { code: 'HOUSING', dept: 'HOUSING', sensitive: false, name: { te: 'గృహనిర్మాణం', en: 'Housing', hi: 'आवास' } },
  { code: 'ELECTRICITY', dept: 'ELECTRICITY', sensitive: false, name: { te: 'విద్యుత్', en: 'Electricity', hi: 'बिजली' } },
  { code: 'PUBLIC_DISTRIBUTION_SYSTEM', dept: 'PDS', sensitive: false, name: { te: 'ప్రజా పంపిణీ వ్యవస్థ', en: 'Public Distribution System', hi: 'सार्वजनिक वितरण प्रणाली' } },
  { code: 'WOMEN_CHILD_WELFARE', dept: 'WOMEN_CHILD', sensitive: false, name: { te: 'మహిళా శిశు సంక్షేమం', en: 'Women & Child Welfare', hi: 'महिला एवं बाल कल्याण' } },
  { code: 'EMPLOYMENT', dept: 'EMPLOYMENT', sensitive: false, name: { te: 'ఉద్యోగం', en: 'Employment', hi: 'रोजगार' } },
  { code: 'ENVIRONMENT', dept: 'ENVIRONMENT', sensitive: false, name: { te: 'పర్యావరణం', en: 'Environment', hi: 'पर्यावरण' } },
  { code: 'CORRUPTION', dept: 'VIGILANCE', sensitive: true, name: { te: 'అవినీతి', en: 'Corruption', hi: 'भ्रष्टाचार' } },
  { code: 'BRIBERY', dept: 'VIGILANCE', sensitive: true, name: { te: 'లంచం', en: 'Bribery', hi: 'रिश्वतखोरी' } },
  { code: 'STAFF_MISCONDUCT', dept: 'VIGILANCE', sensitive: true, name: { te: 'సిబ్బంది దుష్ప్రవర్తన', en: 'Staff Misconduct', hi: 'स्टाफ का दुर्व्यवहार' } },
  { code: 'ABUSE_OF_POWER', dept: 'VIGILANCE', sensitive: true, name: { te: 'అధికార దుర్వినియోగం', en: 'Abuse of Power', hi: 'शक्ति का दुरुपयोग' } },
  { code: 'NEGLIGENCE', dept: 'VIGILANCE', sensitive: true, name: { te: 'నిర్లక్ష్యం', en: 'Negligence', hi: 'लापरवाही' } },
  { code: 'OTHER', dept: 'GENERAL', sensitive: false, name: { te: 'ఇతరం', en: 'Other', hi: 'अन्य' } }
];

// The five sensitive categories above (Corruption, Bribery, Staff
// Misconduct, Abuse of Power, Negligence) are the only categories
// eligible for anonymous complaint submission - enforced at the service
// layer by checking category.isSensitive (see anonymous.service.js).

async function seed() {
  await connectDB();
  logger.info('Seeding departments and categories...');

  const departmentIdByKey = {};
  for (const dept of DEPARTMENTS) {
    let doc = await Department.findOne({ 'name.en': dept.name.en });
    if (!doc) {
      doc = await Department.create({
        name: dept.name,
        description: { te: dept.name.te, en: dept.name.en, hi: dept.name.hi }
      });
    }
    departmentIdByKey[dept.key] = doc._id;
  }

  for (const cat of CATEGORIES) {
    const departmentId = departmentIdByKey[cat.dept];
    let category = await Category.findOne({ code: cat.code });
    if (!category) {
      category = await Category.create({
        code: cat.code,
        name: cat.name,
        isSensitive: cat.sensitive,
        defaultDepartmentId: departmentId,
        isActive: true
      });
    }

    const existingMapping = await CategoryDepartmentMapping.findOne({
      categoryId: category._id,
      departmentId
    });
    if (!existingMapping) {
      await CategoryDepartmentMapping.create({ categoryId: category._id, departmentId, isPrimary: true });
    }
  }

  logger.info('Departments and categories seed complete');
  await disconnectDB();
  process.exit(0);
}

seed().catch((err) => {
  logger.error('Category seed failed', { error: err.message, stack: err.stack });
  process.exit(1);
});
