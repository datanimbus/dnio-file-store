const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const { pipeline } = require('stream/promises');

function DiskStorageService(options) {
    this.options = options;
    this.bucket = options.bucket;
}

DiskStorageService.prototype.getBuffer = async function (options) {
    const filePath = path.join(this.bucket, options.key);
    const bufferData = await fsp.readFile(filePath);
    return bufferData;
}

DiskStorageService.prototype.setBuffer = async function (options) {
    const filePath = path.join(this.bucket, options.key);
    const dirPath = path.dirname(filePath);
    await fsp.mkdir(dirPath, { recursive: true });
    await fsp.writeFile(filePath, options.data);
    return {
        key: options.key,
        bucket: this.bucket,
        storageService: 'disk'
    };
}

DiskStorageService.prototype.getStream = async function (options) {
    const filePath = path.join(this.bucket, options.key);
    return fs.createReadStream(filePath);
}

DiskStorageService.prototype.setStream = async function (options) {
    const filePath = path.join(this.bucket, options.key);
    const dirPath = path.dirname(filePath);
    await fsp.mkdir(dirPath, { recursive: true });
    await pipeline(options.stream, fs.createWriteStream(filePath));
    return {
        key: options.key,
        bucket: this.bucket,
        storageService: 'disk'
    };
}
module.exports.DiskStorageService = DiskStorageService;