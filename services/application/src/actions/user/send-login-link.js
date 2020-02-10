const { createError } = require('micro');
const { createRequiredParamError } = require('@base-cms/micro').service;
const { tokenService, mailerService } = require('@base-cms/id-me-service-clients');
const { Application } = require('../../mongodb/models');
const { SENDING_DOMAIN, SUPPORT_EMAIL, SUPPORT_ENTITY } = require('../../env');
const findByEmail = require('./find-by-email');

const createLoginToken = ({
  email,
  applicationId,
  fields,
  ttl = 60 * 60,
} = {}) => tokenService.request('create', {
  payload: { aud: email, fields },
  iss: applicationId,
  sub: 'app-user-login-link',
  ttl,
});

module.exports = async ({
  authUrl,
  redirectTo,
  applicationId,
  email,
  fields,
} = {}) => {
  if (!authUrl) throw createRequiredParamError('authUrl');
  if (!applicationId) throw createRequiredParamError('applicationId');
  if (!email) throw createRequiredParamError('email');

  const [app, user] = await Promise.all([
    Application.findById(applicationId, ['id', 'name', 'email']),
    findByEmail({ applicationId, email, fields: ['id', 'email'] }),
  ]);

  if (!app) throw createError(404, `No application was found for '${applicationId}'`);
  if (!user) throw createError(404, `No user was found for '${email}'`);

  // Ensure any new, incoming fields will pass validation.
  if (fields) {
    user.set(fields);
    await user.validate();
  }

  const { token } = await createLoginToken({ applicationId, email: user.email, fields });
  let url = `${authUrl}?token=${token}`;
  if (redirectTo) url = `${url}&redirectTo=${encodeURIComponent(redirectTo)}`;
  const supportEmail = app.email || SUPPORT_EMAIL;
  const html = `
    <!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" id="viewport" content="width=device-width,minimum-scale=1.0,maximum-scale=10.0,initial-scale=1.0">
        <title>Your personal login link</title>
      </head>
      <body>
        <h1>Your personal login link.</h1>
        <p>You recently requested to login to <strong>${app.name}</strong>. This link is good for one hour and will expire immediately after use.</p>
        <p><a href="${url}">Login to ${app.name}</a></p>
        <p>If you didn't request this link, simply ignore this email or <a href="mailto:${supportEmail}">contact our support staff</a>.</p>
        <hr>
        <small style="font-color: #ccc;">
          <p>Please add <em>${SENDING_DOMAIN}</em> to your address book or safe sender list to ensure you receive future emails from us.</p>
          <p>You are receiving this email because a login request was made on ${app.name}.</p>
          <p>For additional information please contact ${app.name} c/o ${SUPPORT_ENTITY}, ${supportEmail}.</p>
        </small>
      </body>
    </html>
  `;

  const text = `
Your personal login link.
-------------------------

You recently requested to login to ${app.name}. This link is good for one hour and will expire immediately after use.

Login to ${app.name} by visiting this link:
${url}

If you didn't request this link, simply ignore this email or contact our support staff at ${supportEmail}.

-------------------------

Please add ${SENDING_DOMAIN} to your address book or safe sender list to ensure you receive future emails from us.
You are receiving this email because a login request was made on ${app.name}.
For additional information please contact ${app.name} c/o ${SUPPORT_ENTITY}, ${supportEmail}.
  `;

  await mailerService.request('send', {
    to: user.email,
    from: `${app.name} <noreply@${SENDING_DOMAIN}>`,
    subject: 'Your personal login link',
    html,
    text,
  });
  return 'ok';
};
