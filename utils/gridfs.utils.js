const { MongoClient, GridFSBucket } = require('mongodb');

function GridFSStorageService(options) {
	this.options = options;
	this.client = new MongoClient(options.connectionString);
	this.bucket = new GridFSBucket(this.client, {
		bucketName: options.bucket
	});
}

GridFSStorageService.prototype.getBuffer = async function (options) {
	const bufferData = await new Promise((resolve, reject) => {
		const downloadStream = this.bucket.openDownloadStream(options.key);
		let bufferList = [];
		downloadStream.on('data', (chunk) => bufferList.push(chunk));
		downloadStream.on('error', reject);
		downloadStream.on('end', () => resolve(Buffer.concat(bufferList)));
	});
	return bufferData;
}

GridFSStorageService.prototype.setBuffer = async function (options) {
	const uploadStream = this.bucket.openUploadStream(options.key, {
		metadata: options.metadata
	});
	uploadStream.write(options.data);
	uploadStream.end();
}

module.exports.GridFSStorageService = GridFSStorageService;