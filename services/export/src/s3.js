const AWS = require('aws-sdk');
const {
  AWS_ACCESS_KEY_ID,
  AWS_S3_BUCKET_NAME,
  AWS_SECRET_ACCESS_KEY,
} = require('./env');

const client = new AWS.S3({
  signatureVersion: 'v4',
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
});

module.exports = {
  client,
  sign: async ({ filename }) => client.getSignedUrlPromise('getObject', {
    Bucket: AWS_S3_BUCKET_NAME,
    Key: filename,
    Expires: 60 * 60 * 24 * 7, // Maximum duration is 1 week
  }),
  upload: ({ filename, contents }) => new Promise((resolve, reject) => client.putObject({
    Body: contents,
    Bucket: AWS_S3_BUCKET_NAME,
    ContentDisposition: `attachment; filename="${filename}"`,
    ContentType: 'text/csv; charset=utf8',
    Key: filename,
  }, (err, data) => {
    if (err) {
      reject(err);
    } else {
      resolve(data);
    }
  })),
};
