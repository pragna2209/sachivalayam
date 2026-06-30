/**
 * Notification title/body are always stored as { te, en, hi } objects
 * (Section 6.2.9 / 10.4) and rendered in the recipient's preferredLanguage
 * at read time, not at creation time. This module builds that trilingual
 * object for every notification trigger in the catalog (Section 10.3).
 */

function complaintRegistered(complaintNumber) {
  return {
    title: { te: 'ఫిర్యాదు నమోదు చేయబడింది', en: 'Complaint Registered', hi: 'शिकायत दर्ज की गई' },
    body: {
      te: `మీ ఫిర్యాదు ${complaintNumber} విజయవంతంగా నమోదు చేయబడింది.`,
      en: `Your complaint ${complaintNumber} has been registered successfully.`,
      hi: `आपकी शिकायत ${complaintNumber} सफलतापूर्वक दर्ज की गई है।`
    }
  };
}

function complaintAssigned(complaintNumber) {
  return {
    title: { te: 'ఫిర్యాదు కేటాయించబడింది', en: 'Complaint Assigned', hi: 'शिकायत आवंटित की गई' },
    body: {
      te: `ఫిర్యాదు ${complaintNumber} సిబ్బందికి కేటాయించబడింది.`,
      en: `Complaint ${complaintNumber} has been assigned to staff.`,
      hi: `शिकायत ${complaintNumber} स्टाफ को सौंपी गई है।`
    }
  };
}

function statusChanged(complaintNumber, newStatus) {
  return {
    title: { te: 'ఫిర్యాదు స్థితి నవీకరించబడింది', en: 'Complaint Status Updated', hi: 'शिकायत की स्थिति अपडेट हुई' },
    body: {
      te: `ఫిర్యాదు ${complaintNumber} స్థితి ఇప్పుడు: ${newStatus}`,
      en: `Complaint ${complaintNumber} status is now: ${newStatus}`,
      hi: `शिकायत ${complaintNumber} की स्थिति अब है: ${newStatus}`
    }
  };
}

function escalationFired(complaintNumber, level) {
  return {
    title: { te: 'ఫిర్యాదు పెంచబడింది', en: 'Complaint Escalated', hi: 'शिकायत आगे बढ़ाई गई' },
    body: {
      te: `ఫిర్యాదు ${complaintNumber} ${level} స్థాయికి పెంచబడింది.`,
      en: `Complaint ${complaintNumber} has been escalated to ${level}.`,
      hi: `शिकायत ${complaintNumber} को ${level} स्तर तक बढ़ाया गया है।`
    }
  };
}

function feedbackRequested(complaintNumber) {
  return {
    title: { te: 'అభిప్రాయం కోరబడింది', en: 'Feedback Requested', hi: 'प्रतिक्रिया का अनुरोध' },
    body: {
      te: `ఫిర్యాదు ${complaintNumber} పరిష్కరించబడింది. దయచేసి మీ అభిప్రాయాన్ని తెలియజేయండి.`,
      en: `Complaint ${complaintNumber} has been resolved. Please share your feedback.`,
      hi: `शिकायत ${complaintNumber} हल कर दी गई है। कृपया अपनी प्रतिक्रिया दें।`
    }
  };
}

function complaintReopened(complaintNumber) {
  return {
    title: { te: 'ఫిర్యాదు తిరిగి తెరవబడింది', en: 'Complaint Reopened', hi: 'शिकायत फिर से खोली गई' },
    body: {
      te: `ఫిర్యాదు ${complaintNumber} పౌరుడు తిరిగి తెరిచారు.`,
      en: `Complaint ${complaintNumber} has been reopened by the citizen.`,
      hi: `शिकायत ${complaintNumber} नागरिक द्वारा फिर से खोली गई है।`
    }
  };
}

function staffAccountCreated(name) {
  return {
    title: { te: 'ఖాతా సృష్టించబడింది', en: 'Account Created', hi: 'खाता बनाया गया' },
    body: {
      te: `${name}, మీ ఖాతా సిస్టమ్‌లో సృష్టించబడింది.`,
      en: `${name}, your account has been created in the system.`,
      hi: `${name}, सिस्टम में आपका खाता बना दिया गया है।`
    }
  };
}

module.exports = {
  complaintRegistered,
  complaintAssigned,
  statusChanged,
  escalationFired,
  feedbackRequested,
  complaintReopened,
  staffAccountCreated
};
