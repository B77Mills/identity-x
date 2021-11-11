const { Schema } = require('mongoose');
const { stripLines } = require('@identity-x/utils');
const { emailPlugin } = require('@identity-x/mongoose-plugins');

const companySchema = new Schema({
  name: {
    type: String,
    trim: true,
    set: stripLines,
  },
  streetAddress: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
    set: stripLines,
  },
  regionName: {
    type: String,
    trim: true,
    set: stripLines,
  },
  postalCode: {
    type: String,
    trim: true,
    set: stripLines,
  },
  phoneNumber: {
    type: String,
    trim: true,
    set: stripLines,
  },
});

companySchema.plugin(emailPlugin, { name: 'supportEmail', options: { required: false } });

const regionalConsentPolicySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  countryCodes: {
    type: [String],
    default: () => [],
    validate: {
      validator(codes) {
        return Boolean(codes.length);
      },
    },
  },
  enabled: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
  },
  required: {
    type: Boolean,
    default: false,
  },
});

const schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  photoURL: {
    type: String,
    trim: false,
    default() {
      return `https://robohash.org/${this.id}?set=set3&bgset=bg2`;
    },
  },
  consentPolicy: {
    type: String,
    trim: true,
  },
  emailConsentRequest: {
    type: String,
    trim: true,
  },
  /**
   * The the amount of time, in days, that an AppUser's profile can
   * remain stale until needing to be resubmitted. A null value means
   * no stale time is enforced.
   */
  appUserAllowedStaleDays: {
    type: Number,
    default: null,
    set: (v) => {
      if (!v || Number.isNaN(v) || v < 0) return null;
      return v;
    },
  },
  regionalConsentPolicies: {
    type: [regionalConsentPolicySchema],
    default: () => [],
  },
  company: {
    type: companySchema,
  },
}, { timestamps: true });

module.exports = schema;
