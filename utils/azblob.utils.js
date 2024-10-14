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
	const uploadBlobResponse = await blockBlobClient.upload(options.data, options.data.length);
	return uploadBlobResponse;
}

module.exports.AzureBlobStorageService = AzureBlobStorageService;