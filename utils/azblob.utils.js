const { BlobServiceClient } = require('@azure/storage-blob');

function AzureBlobStorageService(options) {
    this.client = BlobServiceClient.fromConnectionString(options.connectionString);
	this.bucket = options.bucket;
}

AzureBlobStorageService.prototype.getBuffer = async function (options) {
	const containerClient = this.client.getContainerClient(this.bucket);
	const blockBlobClient = containerClient.getBlockBlobClient(options.key);
	const bufferData = await blockBlobClient.downloadToBuffer();
	return bufferData;
}

AzureBlobStorageService.prototype.setBuffer = async function (options) {
	const containerClient = this.client.getContainerClient(this.bucket);
	const blockBlobClient = containerClient.getBlockBlobClient(options.key);
	await blockBlobClient.upload(options.data, options.data.length);
	return {
		key: options.key,
		bucket: this.bucket,
		storageService: 'azureblob'
	};
}

AzureBlobStorageService.prototype.getStream = async function (options) {
	const containerClient = this.client.getContainerClient(this.bucket);
	const blockBlobClient = containerClient.getBlockBlobClient(options.key);
	const downloadResponse = await blockBlobClient.download();
	return downloadResponse.readableStreamBody;
}

AzureBlobStorageService.prototype.setStream = async function (options) {
	const containerClient = this.client.getContainerClient(this.bucket);
	const blockBlobClient = containerClient.getBlockBlobClient(options.key);
	await blockBlobClient.uploadStream(options.stream);
	return {
		key: options.key,
		bucket: this.bucket,
		storageService: 'azureblob'
	};
}

AzureBlobStorageService.prototype.getSize = async function (options) {
	const containerClient = this.client.getContainerClient(this.bucket);
	const blockBlobClient = containerClient.getBlockBlobClient(options.key);
	const props = await blockBlobClient.getProperties();
	return props.contentLength;
}

module.exports.AzureBlobStorageService = AzureBlobStorageService;