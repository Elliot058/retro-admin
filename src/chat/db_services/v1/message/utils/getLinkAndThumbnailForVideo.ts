/**
 * Created By Soumya(soumya@smartters.in) on 1/9/2023 at 9:54 PM.
 */
import moment from 'moment';
import { S3Utilities } from '../../../../utils/S3Utilities/S3Utilities';
import fs from 'fs';
import extractThumbnail from '../../../../utils/extractThumbnail';
import getVideoDurationInSeconds from 'get-video-duration';
import { BadRequest } from '@feathersjs/errors';
import rimraf from 'rimraf';

/**
 * Get link, thumbnail and duration for video.
 * @param file
 * @param bucketName
 */
const getLinkAndThumbnailForVideo = async (
    file: Express.Multer.File,
    bucketName: string,
): Promise<{ uploadUrl: string; thumbnailUrl: string; duration: number }> => {
    const { mimetype, originalname, buffer } = file;
    const timestamp = Date.now();

    const folder1 = moment(new Date()).format('YYYY');
    const folder2 = moment(new Date()).format('MMDD');
    const fileKey = `videos/${folder1}/${folder2}/${timestamp}_${originalname}`;
    const thumbnailKey = `videos/${folder1}/${folder2}/${timestamp}_thumbnail_${originalname.substring(
        0,
        originalname.lastIndexOf('.'),
    )}.jpg`;
    // Upload the file.
    const uploadData = await S3Utilities.uploadFile(fileKey, buffer, mimetype, bucketName);
    const uploadUrl = uploadData.Location;

    /**
     * Extract thumbnail.
     */
    // Make directory temporary.
    const dir = `src/chat/temp/video_${timestamp}`;
    const videoFileKey = `${dir}/${timestamp}_${originalname}`;
    const thumbnailFileKey = `${dir}/${timestamp}_thumbnail_${Date.now()}_picture_1.jpg`;

    // Write file and extract thumbnail.
    fs.mkdirSync(dir);
    fs.writeFileSync(videoFileKey, buffer);
    await extractThumbnail(videoFileKey, thumbnailFileKey).catch(() => {
        throw new BadRequest('Video can not be sent.');
    });

    // Upload thumbnail image to s3.
    const thumbnailData = await S3Utilities.uploadFile(
        thumbnailKey,
        fs.readFileSync(thumbnailFileKey),
        'image/jpeg',
        bucketName,
    );
    const thumbnailUrl = thumbnailData.Location;

    // Get video duration in seconds.
    const duration = await getVideoDurationInSeconds(videoFileKey);

    rimraf.sync(dir);

    return {
        uploadUrl,
        thumbnailUrl,
        duration: parseFloat(duration.toFixed(0)),
    };
};

export default getLinkAndThumbnailForVideo;
