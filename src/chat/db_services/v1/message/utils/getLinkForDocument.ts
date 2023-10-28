/**
 * Created By Soumya(soumya@smartters.in) on 1/9/2023 at 9:54 PM.
 */
import moment from 'moment';
import { S3Utilities } from '../../../../utils/S3Utilities/S3Utilities';

/**
 * Get link for documents.
 * @param file
 * @param bucketName
 */
const getLinkForDocument = async (file: Express.Multer.File, bucketName: string): Promise<{ uploadUrl: string }> => {
    const { mimetype, originalname, buffer } = file;
    const timestamp = Date.now();

    const folder1 = moment(new Date()).format('YYYY');
    const folder2 = moment(new Date()).format('MMDD');
    const fileKey = `documents/${folder1}/${folder2}/${timestamp}_${originalname}`;

    // Upload the file.
    const uploadData = await S3Utilities.uploadFile(fileKey, buffer, mimetype, bucketName);
    const uploadUrl = uploadData.Location;

    return {
        uploadUrl,
    };
};

export default getLinkForDocument;
