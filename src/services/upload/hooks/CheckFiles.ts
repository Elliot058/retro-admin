/**
 * Created By Soumya(soumya@smarttersstudio.com) on 2/23/2022 at 12:01 AM.
 */
import { HookContext } from '@feathersjs/feathers';
import { BadRequest } from '@feathersjs/errors';
import moment from 'moment';
// import uploadToS3 from '../../../../utils/uploadToS3';
import { S3Utilities } from '../../../../utils/S3Utilities/S3Utilities';
const fileTypes = [1, 2];
const purposes = ['profile', 'persona', 'report'];

/**
 * @description upload all files.
 * @constructor
 */
const CheckFiles = () => async (context: HookContext) => {
    const { data, app } = context;


    const { files, fileType, purpose } = data;

    if (!fileTypes.includes(parseInt(fileType))) throw new BadRequest('Please provide a valid file type.');

    if (!purposes.includes(purpose.trim())) throw new BadRequest('Please provide a valid purpose.');

    const bucket = app.get('aws-bucket');

    const uploadedFiles: string[] = [];

    for (const file of files) {
        const fileType = file.mimeType;

        const timestamp = Date.now();
        const fileName = file.originalname;
        const folder1 = moment(new Date()).format('YYYY');
        const folder2 = moment(new Date()).format('MMDD');
        const fileKey = `${purpose}/${folder1}/${folder2}/${timestamp}_${fileName}`;

        const uploadData = await S3Utilities.uploadFile(fileKey, file.buffer, fileType, bucket);

        if (!uploadData) {
            throw new BadRequest('Error while uploading. Please try after some time.');
        }

        const filePath = uploadData.Location;

        uploadedFiles.push(filePath);
    }

    context.data = uploadedFiles.map((e) => {
        return {
            purpose,
            filePath: e,
            fileType,
        };
    });

    context.params.query = {
        $limit: uploadedFiles.length,
    };
};

export default CheckFiles;
