const fsp = require('fs').promises;
const path = require('path');

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
    await fsp.writeFile(filePath, options.data);
	return {
		key: options.key,
		bucket: this.bucket,
		storageService: 'disk'
	};
}
module.exports.DiskStorageService = DiskStorageService;