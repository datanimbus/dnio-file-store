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
}

module.exports = StorageService;
