const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3-v2");
const config = require('../../config')


const s3 = new aws.S3({
    endpoint: new aws.Endpoint(config.get('bucket.digitalocean.url')),
    accessKeyId: config.get('bucket.digitalocean.access_key'),
    secretAccessKey: config.get('bucket.digitalocean.secret_key'),
    region: config.get('bucket.digitalocean.region'),
});

const applicantUpload = multer({
    storage: multerS3({
        s3,
        bucket: config.get('bucket.digitalocean.name'),
        metadata: function(req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function(req, file, cb) {
            cb(null, `applicants/${Date.now().toString()}_${file.originalname}`);
        }
    })
});

const beneficaryUpload = multer({
    storage: multerS3({
        s3,
        bucket: config.get('bucket.digitalocean.name'),
        metadata: function(req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function(req, file, cb) {
            cb(null, `beneficiaries/${Date.now().toString()}_${file.originalname}`);
        }
    })
});

module.exports = {
    applicantUpload,
    beneficaryUpload,
    s3
}