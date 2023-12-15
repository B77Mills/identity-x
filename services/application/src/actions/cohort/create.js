const { createError } = require('micro');
const { createRequiredParamError } = require('@base-cms/micro').service;
const { handleError } = require('@identity-x/utils').mongoose;
const { isObject } = require('@base-cms/utils');

const { Application, Cohort } = require('../../mongodb/models');

module.exports = async ({ applicationId, payload } = {}) => {
  if (!applicationId) throw createRequiredParamError('applicationId');
  if (!isObject(payload)) throw createRequiredParamError('payload');

  const application = await Application.findById(applicationId, ['id']);
  if (!application) throw createError(404, `No application was found for '${applicationId}'`);

  try {
    const level = await Cohort.create({
      ...payload,
      applicationId,
    });
    return level;
  } catch (e) {
    throw handleError(createError, e);
  }
};
