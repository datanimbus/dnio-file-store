const { MongoClient, GridFSBucket } = require('mongodb');
const { pipeline } = require('stream/promises');

function GridFSStorageService(options) {
	this.options = options;
	this.client = new MongoClient(options.connectionString);
	this.client.connect();
    this.db = this.client.db(options.dbName); 
	this.bucket = new GridFSBucket(this.db, {
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
	return {
		key: options.key,
		bucket: this.bucket,
		storageService: 'gridfs'
	};
}

GridFSStorageService.prototype.getStream = async function (options) {
	return this.bucket.openDownloadStream(options.key);
}

GridFSStorageService.prototype.setStream = async function (options) {
	const uploadStream = this.bucket.openUploadStream(options.key, {
		metadata: options.metadata
	});
	await pipeline(options.stream, uploadStream);
	return {
		key: options.key,
		bucket: this.bucket,
		storageService: 'gridfs'
	};
}

module.exports.GridFSStorageService = GridFSStorageService;