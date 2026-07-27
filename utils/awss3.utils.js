const { S3Client, GetObjectCommand, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');

function AWSS3StorageService(options) {
	this.client = new S3Client(options);
	this.bucket = options.bucket;
}

AWSS3StorageService.prototype.getBuffer = async function (options) {
	const input = {
		Bucket: this.bucket,
		Key: options.key
	};
	const command = new GetObjectCommand(input);
	const response = await this.client.send(command);
	const streamToBuffer = (stream) =>
		new Promise((resolve, reject) => {
			const chunks = [];
			stream.on('data', (chunk) => chunks.push(chunk));
			stream.on('error', reject);
			stream.on('end', () => resolve(Buffer.concat(chunks)));
		});
	const bufferData = await streamToBuffer(response.Body);
	return bufferData;
}

AWSS3StorageService.prototype.setBuffer = async function (options) {
	const input = {
		Bucket: this.bucket,
		Key: options.key,
		Body: options.data
	};
	const command = new PutObjectCommand(input);
	await this.client.send(command);
	return {
		key: options.key,
		bucket: this.bucket,
		storageService: 'awss3'
	};
}

AWSS3StorageService.prototype.getStream = async function (options) {
	const input = {
		Bucket: this.bucket,
		Key: options.key
	};
	const command = new GetObjectCommand(input);
	const response = await this.client.send(command);
	return response.Body;
}

AWSS3StorageService.prototype.setStream = async function (options) {
	const upload = new Upload({
		client: this.client,
		params: {
			Bucket: this.bucket,
			Key: options.key,
			Body: options.stream
		}
	});
	await upload.done();
	return {
		key: options.key,
		bucket: this.bucket,
		storageService: 'awss3'
	};
}

AWSS3StorageService.prototype.getSize = async function (options) {
	const command = new HeadObjectCommand({ Bucket: this.bucket, Key: options.key });
	const response = await this.client.send(command);
	return response.ContentLength;
}

module.exports.AWSS3StorageService = AWSS3StorageService;