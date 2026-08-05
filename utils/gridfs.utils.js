const { MongoClient, GridFSBucket } = require('mongodb');
const { pipeline } = require('stream/promises');

function GridFSStorageService(options) {
	this.options = options;
	this.client = new MongoClient(options.connectionString);
	this.client.connect();
    this.db = this.client.db(options.dbName);
	this.bucket = new GridFSBucket(this.db, {
		bucketName: options.bucket,
		// Reads must see the file this same process just wrote. On a replica
		// set, a secondary can lag behind the primary just long enough for
		// an upload's own verification/download-immediately-after-upload to
		// miss a file that was, in fact, successfully written.
		readPreference: 'primary'
	});
	console.log(`[dnio-file-store] GridFS targeting db="${options.dbName}" bucket="${options.bucket}" (collections: ${options.bucket}.files, ${options.bucket}.chunks)`);
}

GridFSStorageService.prototype.getBuffer = async function (options) {
	const bufferData = await new Promise((resolve, reject) => {
		const downloadStream = this.bucket.openDownloadStreamByName(options.key);
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
	return this.bucket.openDownloadStreamByName(options.key);
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

GridFSStorageService.prototype.getSize = async function (options) {
	console.log(`[dnio-file-store] getSize querying db="${this.options.dbName}" collection="${this.options.bucket}.files" filename="${options.key}"`);
	// GridFS allows multiple files to share a filename (revisions) - match
	// openDownloadStreamByName's default of resolving to the latest one.
	const doc = await this.bucket.find({ filename: options.key }, { readPreference: 'primary' }).sort({ uploadDate: -1 }).next();
	if (!doc) {
		throw new Error(`File not found: ${options.key}`);
	}
	return doc.length;
}

module.exports.GridFSStorageService = GridFSStorageService;