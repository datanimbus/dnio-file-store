const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');

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
}

module.exports.AWSS3StorageService = AWSS3StorageService;