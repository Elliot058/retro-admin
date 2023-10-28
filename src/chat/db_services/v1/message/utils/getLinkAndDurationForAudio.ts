/**
 * Created By Soumya(soumya@smartters.in) on 1/9/2023 at 9:54 PM.
 */
import moment from 'moment';
import { S3Utilities } from '../../../../utils/S3Utilities/S3Utilities';
import fs from 'fs';
import getAudioDurationInSeconds from 'get-audio-duration';
import rimraf from 'rimraf';

/**
 * Get link and duration for audio.
 * @param file
 * @param bucketName
 */
const getLinkAndDurationForAudio = async (
    file: Express.Multer.File,
    bucketName: string,
): Promise<{ uploadUrl: string; duration: number }> => {
    const { mimetype, originalname, buffer } = file;
    const timestamp = Date.now();

    const folder1 = moment(new Date()).format('YYYY');
    const folder2 = moment(new Date()).format('MMDD');
    const fileKey = `audios/${folder1}/${folder2}/${timestamp}_${originalname}`;

    // Upload the file.
    const uploadData = await S3Utilities.uploadFile(fileKey, buffer, mimetype, bucketName);
    const uploadUrl = uploadData.Location;

    // Get audio duration in seconds.
    const dir = `src/chat/temp/video_${timestamp}`;
    const audioFileKey = `${dir}/${timestamp}_${originalname}`;

    // Write file
    fs.mkdirSync(dir);
    fs.writeFileSync(audioFileKey, buffer);

    const duration = await getAudioDurationInSeconds(audioFileKey);

    rimraf.sync(dir);

    return {
        uploadUrl,
        duration: parseFloat(duration.toFixed(0)),
    };
};

export default getLinkAndDurationForAudio;
