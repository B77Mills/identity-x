const { createError } = require('micro');
const { createRequiredParamError, createParamError } = require('@base-cms/micro').service;
const { handleError } = require('@identity-x/utils').mongoose;
const { Application } = require('../../mongodb/models');
const SelectField = require('../../mongodb/models/field/select');
const prepareExternalId = require('./utils/prepare-external-id');

const createSelect = async ({
  application,
  name,
  label,
  required,
  active,
  multiple,
  externalId: eid,
  options,
} = {}) => {
  const externalId = prepareExternalId(eid);
  const select = new SelectField({
    applicationId: application._id,
    name,
    label,
    required,
    active,
    multiple,
    externalId,
    options: options.map((option, index) => ({
      ...option,
      externalIdentifier: externalId ? option.externalIdentifier : null,
      index,
    })),
  });
  await select.save();
  return select;
};

module.exports = async ({
  type,
  applicationId,
  payload = {},
} = {}) => {
  const supportedTypes = ['select'];
  if (!supportedTypes.includes(type)) throw createParamError('type', type, supportedTypes);
  if (!applicationId) throw createRequiredParamError('applicationId');

  const application = await Application.findById(applicationId, ['id']);
  if (!application) throw createError(404, `No application was found for '${applicationId}'`);

  // for now, only select field types are supported.
  try {
    return createSelect({ ...payload, application });
  } catch (e) {
    throw handleError(createError, e);
  }
};
