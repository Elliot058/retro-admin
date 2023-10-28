/**
 * Created By Soumya(soumya@smartters.in) on 1/9/2023 at 9:54 PM.
 */
import moment from 'moment';
import { S3Utilities } from '../../../../utils/S3Utilities/S3Utilities';
import imageThumbnail from 'image-thumbnail';

/**
 * Get link and thumbnail for image.
 * @param file
 * @param bucketName
 */
const getLinkAndThumbnailForImage = async (
    file: Express.Multer.File,
    bucketName: string,
): Promise<{ uploadUrl: string; thumbnailUrl: string }> => {
    const { mimetype, originalname, buffer } = file;
    const timestamp = Date.now();

    const folder1 = moment(new Date()).format('YYYY');
    const folder2 = moment(new Date()).format('MMDD');
    const fileKey = `images/${folder1}/${folder2}/${timestamp}_${originalname}`;
    const thumbnailKey = `images/${folder1}/${folder2}/${timestamp}_thumbnail_${originalname}`;

    // Upload the file.
    const uploadData = await S3Utilities.uploadFile(fileKey, buffer, mimetype, bucketName);
    const uploadUrl = uploadData.Location;

    // Extract thumbnail.
    const thumbnail = await imageThumbnail(buffer, {
        percentage: 50,
        responseType: 'buffer',
    });
    const thumbnailData = await S3Utilities.uploadFile(thumbnailKey, thumbnail, mimetype, bucketName);
    const thumbnailUrl = thumbnailData.Location;

    return {
        uploadUrl,
        thumbnailUrl,
    };
};

export default getLinkAndThumbnailForImage;
