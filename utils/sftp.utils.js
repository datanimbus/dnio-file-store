const os = require('os');
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const { v4: uuid } = require('uuid');
const SftpClient = require('ssh2-sftp-client');

function SFTPStorageService(options) {
    this.options = options;
    this.bucket = options.bucket;
    this.client = new SftpClient();
}

SFTPStorageService.prototype.getBuffer = async function (options) {
    await this.client.connect(this.options);
    const filePath = path.join(this.bucket, options.key);
    const downloadPath = path.join(os.tmpdir(), uuid());
    await this.client.fastGet(filePath, downloadPath);
    const bufferData = await fsp.readFile(downloadPath);
    await this.client.end();
    await fsp.unlink(downloadPath);
    return bufferData;
}

SFTPStorageService.prototype.setBuffer = async function (options) {
    await this.client.connect(this.options);
    const filePath = path.join(this.bucket, options.key);
    const dirPath = path.dirname(filePath);
    await this.client.mkdir(dirPath, true);
    const uploadPath = path.join(os.tmpdir(), uuid());
    await fsp.writeFile(uploadPath, options.data);
    await this.client.fastPut(uploadPath, filePath);
    await this.client.end();
    await fsp.unlink(uploadPath);
    return {
        key: options.key,
        bucket: this.bucket,
        storageService: 'sftp'
    };
}
// ssh2-sftp-client has no API to obtain a readable stream directly from the
// remote file - get()/fastGet() require a local destination. We still stage
// the file on local disk, but avoid ever holding it as a single in-memory
// Buffer; the caller consumes it as a stream and the temp file is removed
// once fully read.
SFTPStorageService.prototype.getStream = async function (options) {
    await this.client.connect(this.options);
    const filePath = path.join(this.bucket, options.key);
    const downloadPath = path.join(os.tmpdir(), uuid());
    await this.client.fastGet(filePath, downloadPath);
    await this.client.end();
    const readStream = fs.createReadStream(downloadPath);
    const cleanup = () => fsp.unlink(downloadPath).catch(() => { });
    readStream.on('close', cleanup);
    readStream.on('error', cleanup);
    return readStream;
}

SFTPStorageService.prototype.setStream = async function (options) {
    await this.client.connect(this.options);
    const filePath = path.join(this.bucket, options.key);
    const dirPath = path.dirname(filePath);
    await this.client.mkdir(dirPath, true);
    await this.client.put(options.stream, filePath);
    await this.client.end();
    return {
        key: options.key,
        bucket: this.bucket,
        storageService: 'sftp'
    };
}

SFTPStorageService.prototype.getSize = async function (options) {
    await this.client.connect(this.options);
    const filePath = path.join(this.bucket, options.key);
    const stat = await this.client.stat(filePath);
    await this.client.end();
    return stat.size;
}

module.exports.SFTPStorageService = SFTPStorageService;