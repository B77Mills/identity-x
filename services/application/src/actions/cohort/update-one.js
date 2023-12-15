const { createError } = require('micro');
const { createRequiredParamError } = require('@base-cms/micro').service;
const { handleError } = require('@identity-x/utils').mongoose;
const { isObject } = require('@base-cms/utils');

const { Application, Cohort } = require('../../mongodb/models');

module.exports = async ({ id, applicationId, payload } = {}) => {
  if (!id) throw createRequiredParamError('id');
  if (!applicationId) throw createRequiredParamError('applicationId');
  if (!isObject(payload)) throw createRequiredParamError('payload');

  const application = await Application.findById(applicationId, ['id']);
  if (!application) throw createError(404, `No application was found for '${applicationId}'`);

  const cohort = await Cohort.findByIdForApp(id, applicationId);
  if (!cohort) throw createError(404, `No cohort was found for '${id}'`);
  cohort.set(payload);

  try {
    await cohort.save();
    return cohort;
  } catch (e) {
    throw handleError(createError, e);
  }
};
