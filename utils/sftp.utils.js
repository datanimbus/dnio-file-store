const fsp = require('fs').promises;
const path = require('path');
const uuid = require('uuid');
const SftpClient = require('ssh2-sftp-client');

function SFTPStorageService(options) {
    this.options = options;
	this.bucket = options.bucket;
    this.client = new SftpClient();
}

SFTPStorageService.prototype.getBuffer = async function (options) {
    await this.client.connect(this.options);
    const filePath = path.join(this.bucket, options.key);
    const downloadPath = path.join(process.cwd(), 'downloads', uuid.v4());
    await this.client.fastGet(filePath, downloadPath);
    const bufferData = await fsp.readFile(downloadPath);
    await this.client.end();
    await fsp.unlink(downloadPath);
    return bufferData;
}

SFTPStorageService.prototype.setBuffer = async function (options) {
    await this.client.connect(this.options);
    const filePath = path.join(this.bucket, options.key);
    const uploadPath = path.join(process.cwd(), 'uploads', uuid.v4());
    await fsp.writeFile(uploadPath, options.data);
    await this.client.put(uploadPath, filePath);
    await this.client.end();
    await fsp.unlink(uploadPath);
}
module.exports.SFTPStorageService = SFTPStorageService;