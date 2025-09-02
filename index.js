const { GridFSStorageService } = require('./utils/gridfs.utils');
const { AWSS3StorageService } = require('./utils/awss3.utils');
const { DiskStorageService } = require('./utils/disk.utils');
const { GBlobStorageService } = require('./utils/gblob.utils');
const { SFTPStorageService } = require('./utils/sftp.utils');
const { AzureBlobStorageService } = require('./utils/azblob.utils');

class StorageService {
    constructor(storageType, options) {
        this.storageType = storageType;
        this.options = options;
        this.storageService = null;
        if (storageType === 'gridfs') {
            this.storageService = new GridFSStorageService(options);
        } else if (storageType === 'awss3') {
            this.storageService = new AWSS3StorageService(options);
        } else if (storageType === 'disk') {
            this.storageService = new DiskStorageService(options);
        } else if (storageType === 'gblob') {
            this.storageService = new GBlobStorageService(options);
        } else if (storageType === 'sftp') {
            this.storageService = new SFTPStorageService(options);
        } else if (storageType === 'azureblob') {
            this.storageService = new AzureBlobStorageService(options);
        }
    }

    async getBuffer(options) {
        return this.storageService.getBuffer(options);
    }

    async setBuffer(options) {
        return this.storageService.setBuffer(options);
    }

    static getOptionsFromEnv(storageType) {
        const options = {};
        if (storageType === 'gridfs') {
            options.connectionString = process.env.GRIDFS_CONNECTION_STRING;
            options.bucket = process.env.GRIDFS_BUCKET;
        } else if (storageType === 'awss3') {
            options.region = process.env.AWS_S3_REGION;
            options.bucket = process.env.AWS_S3_BUCKET;
            if (process.env.AWS_S3_ACCESS_KEY_ID && process.env.AWS_S3_SECRET_ACCESS_KEY) {
                options.credentials = {
                    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
                };
            }
        } else if (storageType === 'disk') {
            options.bucket = process.env.DISK_PATH;
        } else if (storageType === 'gblob') {
            options.bucket = process.env.GBLOB_BUCKET;
            options.projectId = process.env.GBLOB_PROJECT_ID;
            options.credentials = {
                client_email: process.env.GBLOB_CLIENT_EMAIL,
                private_key: process.env.GBLOB_PRIVATE_KEY,
            };
        } else if (storageType === 'sftp') {
            options.host = process.env.SFTP_HOST;
            options.port = process.env.SFTP_PORT;
            options.username = process.env.SFTP_USERNAME;
            options.password = process.env.SFTP_PASSWORD;
        } else if (storageType === 'azureblob') {
            options.connectionString = process.env.AZURE_CONNECTION_STRING;
            options.bucket = process.env.AZURE_CONTAINER;
        }
        return options;
    }
}

module.exports = StorageService;
