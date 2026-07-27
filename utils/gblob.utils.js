const { Storage } = require('@google-cloud/storage');
const { pipeline } = require('stream/promises');

function GBlobStorageService(options) {
	this.client = new Storage(options);
	this.bucket = options.bucket;
}

GBlobStorageService.prototype.getBuffer = async function (options) {
	const bufferData = await new Promise((resolve, reject) => {
		const downloadStream = this.client
			.bucket(this.bucket)
			.file(options.key)
			.createReadStream();
		let bufferList = [];
		downloadStream.on('data', (chunk) => bufferList.push(chunk));
		downloadStream.on('error', reject);
		downloadStream.on('end', () => resolve(Buffer.concat(bufferList)));
	});
	return bufferData;
}

GBlobStorageService.prototype.setBuffer = async function (options) {
	const bucket = this.client.bucket(this.bucket).file(options.key);
	await bucket.save(options.data);
	return {
		key: options.key,
		bucket: this.bucket,
		storageService: 'gblob'
	};
}

GBlobStorageService.prototype.getStream = async function (options) {
	return this.client
		.bucket(this.bucket)
		.file(options.key)
		.createReadStream();
}

GBlobStorageService.prototype.setStream = async function (options) {
	const file = this.client.bucket(this.bucket).file(options.key);
	await pipeline(options.stream, file.createWriteStream());
	return {
		key: options.key,
		bucket: this.bucket,
		storageService: 'gblob'
	};
}

module.exports.GBlobStorageService = GBlobStorageService;