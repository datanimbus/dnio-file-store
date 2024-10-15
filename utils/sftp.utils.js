const os = require('os');
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
module.exports.SFTPStorageService = SFTPStorageService;