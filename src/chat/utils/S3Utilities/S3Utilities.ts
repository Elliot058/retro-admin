import AWS from 'aws-sdk';
import { DeleteObjectRequest, PutObjectRequest } from 'aws-sdk/clients/s3';
import { PromiseResult } from 'aws-sdk/lib/request';
import { Application } from '../../declarations';
import { Unavailable } from '@feathersjs/errors';
import { AWSConfig } from './S3Interfaces';

/**
 * This class provides all the utilities which are going to be used by S3.
 * For now only the single file upload and single file deletion is added to
 * this class.
 *
 * @remarks
 * The utilities available here:-
 * 1. uploadFile() - Upload single file to s3.
 * 2. deleteFile() = Delete single file from s3.
 *
 */
export class S3Utilities {
    private static _s3: AWS.S3;
    private static _textRact: AWS.Textract;

    /**
     * Initialize AWS with the supplied credentials. After that initialize
     * s3 and textRact field with AWS configuration. First set the aws field with
     * accessKeyId, secretAccessKey, region in the default.json.
     *
     * @remarks
     *
     * The constructor will initialize the s3 and textRact properties of class for further usages.
     *
     * @param app - The application object from Feathers JS.
     */
    static initializeAWS(app: Application): void {
        const awsConfig: AWSConfig = app.get('aws');
        if (!awsConfig) throw new Unavailable('Please provide AWS configuration as mentioned in documentation.');

        const { accessKeyId, secretAccessKey, region } = awsConfig;
        if (!accessKeyId || !secretAccessKey || !region) {
            throw new Unavailable('Please provide all the required configuration values for AWS initialization.');
        }

        AWS.config.update({
            accessKeyId: awsConfig.accessKeyId,
            secretAccessKey: awsConfig.secretAccessKey,
            region: awsConfig.region,
        });
        // Initialize S3
        S3Utilities._s3 = new AWS.S3({ apiVersion: '2006-03-01' });
        S3Utilities._textRact = new AWS.Textract();
    }

    /**
     * Upload the provided file to the s3 bucket and return the response received
     * from the aws s3 to the caller.
     *
     * @remarks
     *
     * This function can upload only a single file to s3 bucket.
     *
     * @param filePath - The complete path with the file name in which file will be stored in the s3 bucket.
     * @param fileBuffer - Content of the file in buffer format.
     * @param fileType - Content type of the file.
     * @param bucket - Bucket of s3 where the file will be stored.
     *
     * @returns The response got from the aws s3 PutObject API which contains the file information according to s3.
     */
    static async uploadFile(
        filePath: string,
        fileBuffer: Buffer,
        fileType: string,
        bucket: string,
    ): Promise<AWS.S3.ManagedUpload.SendData> {
        const uploadParams: PutObjectRequest = {
            ACL: 'public-read', // Give public read access to all objects
            Body: fileBuffer, // The file content to be uploaded to s3.
            Key: filePath, // The Path in s3 bucket where the file will be uploaded.
            ContentType: fileType, // Content type of file.
            Bucket: bucket, // The s3 bucket where the file will be uploaded.
        };

        return await S3Utilities._s3
            .upload(uploadParams)
            .promise()
            .catch((e) => {
                throw e;
            });
    }

    /**
     * Delete the file from s3 from the provided path and returns the deleted object data.
     * from the aws s3 to the caller.
     *
     * @remarks
     * This function can delete only a single file from s3 bucket.
     *
     * @param filePathToS3 - Path in which file will be stored in the s3 bucket.
     * @param bucket - Bucket of s3 where the file will be stored.
     *
     * @returns The response from the s3 bucket delete object api.
     */
    static async deleteFile(
        filePathToS3: string,
        bucket: string,
    ): Promise<PromiseResult<AWS.S3.DeleteObjectOutput, AWS.AWSError>> {
        const deleteObjectParams: DeleteObjectRequest = {
            Key: filePathToS3,
            Bucket: bucket,
        };

        return await S3Utilities._s3
            .deleteObject(deleteObjectParams)
            .promise()
            .catch((e) => {
                throw e;
            });
    }
}
