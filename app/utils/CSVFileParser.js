const fs = require('fs');
const path = require('path');
const aws = require('aws-sdk');
const config = require('../../config');
const fastCsvFormat = require('@fast-csv/format');
const { BadRequest } = require('../tools/errors');
const { s3 } = require('./multer')

class CSVFileParser {
  constructor(spacePath, tmpLocalPath, fileName = null) {
    this._fileName = fileName;
    this.spacePath = spacePath;
    this.tmpLocalPath = tmpLocalPath;
    if (!fs.existsSync(this.tmpLocalPath)) {
      fs.mkdirSync(this.tmpLocalPath, { recursive: true });
    }
    this.headers = [];
    this.csvStream = null;
    this.fileStream = null;
  }

  generateCode() {
    return Math.floor(100000 + Math.random() * 900000);
  }

  generateUniqueCode() {
    return `${this.generateCode()}_${new Date().getTime()}`;
  }

  createFileStream(type = 'file') {
    try {
      const fileName =
        this._fileName !== null && this._fileName !== ''
          ? this._fileName
          : `_${this.generateUniqueCode()}.csv`;
      const filePath = path.resolve(
        __dirname,
        `${this.tmpLocalPath}/${fileName}`
      );
      const file = fs.createWriteStream(filePath, { flag: 'w' });
      const csvStream = fastCsvFormat.format({ headers: this.headers });
      csvStream.pipe(file).on('end', process.exit);

      this.csvStream = csvStream;
      this.filePath = filePath;
      this.fileName = fileName;

      this.fileStream = { csvStream, filePath, fileName };

      return this;
    } catch (err) {
      throw new BadRequest(err);
    }
  }

  getFileStream() {
    return this.fileStream;
  }

  async setCsvStream() {
    const fileStream = await this.createFileStream();

    this.csvStream = fileStream.csvStream;

    return this;
  }

  getStream() {
    return this.csvStream;
  }

  async setHeader(headers) {
    this.headers = headers;

    await this.setCsvStream();

    return this;
  }

  writeStream(row) {
    this.csvStream.write(row);
  }

  end() {
    this.csvStream.end();
    return this;
  }

  async getSpaceUploadPath(space = this.spacePath) {
    if (!space) {
      throw new Error('Space Path URL must be defined for uploading');
    }
    const doResponse = await this.uploadToS3(space);
    this.spacePath = doResponse.Location;

    return this.spacePath;
  }

  getFileName() {
    return this.fileName;
  }

  getFilePath() {
    return this.filePath;
  }

  getAllPath() {
    this.getSpaceUploadPath();
    return { localPath: this.tmpLocalPath, spacePath: this.spacePath };
  }

  async uploadToS3(space = this.spacePath) {
    return new Promise(async (resolve, reject) => {
      try {
        const readStream = fs.createReadStream(this.fileStream.filePath);

        const params = {
          Bucket: config.get('bucket.digitalocean.name'),
          Key: `${space}/${this.fileStream.fileName}`,
          Body: readStream,
          ACL: 'public-read',
        };
        s3.upload(params, (err, data) => {
          if (err) {
            throw new Error(err);
          }

          return resolve(data);
        });
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = CSVFileParser;
