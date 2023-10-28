/**
 * Created by Soumya (soumya@smartters.in) on 01/09/2023 at 10:04 PM
 */
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';

/**
 * Extract thumbnail from video.
 * @param videoKey
 * @param thumbnailKey
 */
const extractThumbnail = async (videoKey: string, thumbnailKey: string) => {
    ffmpeg.setFfmpegPath(ffmpegPath.path);

    return new Promise((resolve, reject) => {
        ffmpeg(videoKey)
            .takeScreenshots(
                {
                    count: 1,
                    filename: thumbnailKey,
                    timemarks: ['1'],
                },
                '',
            )
            .on('end', () => {
                resolve(1);
            })
            .on('error', () => {
                reject('Can not extract thumbnail.');
            });
    });
};

export default extractThumbnail;
