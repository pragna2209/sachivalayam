const en = require('./en.json');
const te = require('./te.json');
const hi = require('./hi.json');
const { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } = require('../config/constants');

const BUNDLES = { en, te, hi };

/**
 * Resolves a single flat message key into the requested language, falling
 * back to English if the key or language is missing. Used everywhere a
 * controller/service needs to send a server-generated message string back
 * to the client in the caller's preferred language.
 */
function t(key, lang = DEFAULT_LANGUAGE) {
  const safeLang = SUPPORTED_LANGUAGES.includes(lang) ? lang : DEFAULT_LANGUAGE;
  const bundle = BUNDLES[safeLang] || BUNDLES[DEFAULT_LANGUAGE];
  return bundle[key] || BUNDLES[DEFAULT_LANGUAGE][key] || key;
}

/**
 * Resolves the active language for a request: authenticated user's stored
 * preference takes priority, falling back to the Accept-Language header,
 * falling back to the default.
 */
function resolveLanguage(req) {
  if (req.user && req.user.preferredLanguage && SUPPORTED_LANGUAGES.includes(req.user.preferredLanguage)) {
    return req.user.preferredLanguage;
  }
  const headerLang = (req.headers['accept-language'] || '').slice(0, 2).toLowerCase();
  if (SUPPORTED_LANGUAGES.includes(headerLang)) {
    return headerLang;
  }
  return DEFAULT_LANGUAGE;
}

module.exports = { t, resolveLanguage, BUNDLES };
