/**
 * Created By Abhilash(abhilash@smartters.in) on 30-12-2022 at 13:25
 */
import { HookContext } from '@feathersjs/feathers';
import { BadRequest } from '@feathersjs/errors';
import { Message_POST, MessageAttachmentType } from '../interfaces/MessageInterface';
import getLinkAndThumbnailForImage from '../utils/getLinkAndThumbnailForImage';
import getLinkAndThumbnailForVideo from '../utils/getLinkAndThumbnailForVideo';
import getLinkAndDurationForAudio from '../utils/getLinkAndDurationForAudio';
import getLinkForDocument from '../utils/getLinkForDocument';

/**
 * Check if attachment format is correct or not.
 */

const ValidateAttachment = () => async (context: HookContext) => {
    const { app } = context;
    const data = context.data as Message_POST;
    const { attachmentType, files } = data;

    if (attachmentType) {
        const type = parseInt(attachmentType) as MessageAttachmentType;
        if (!type || !files) {
            throw new BadRequest('Please provide a valid file.');
        }
        const { size } = files[0];
        let thumbnailUrl = '';
        let uploadUrl = '';
        let duration = 0;

        const bucketName = app.get('aws_bucket');

        switch (type) {
            case MessageAttachmentType.IMAGE:
                const imageUploadData = await getLinkAndThumbnailForImage(files[0], bucketName);
                thumbnailUrl = imageUploadData.thumbnailUrl;
                uploadUrl = imageUploadData.uploadUrl;
                break;
            case MessageAttachmentType.VIDEO:
                const videoUploadData = await getLinkAndThumbnailForVideo(files[0], bucketName);
                thumbnailUrl = videoUploadData.thumbnailUrl;
                uploadUrl = videoUploadData.uploadUrl;
                duration = videoUploadData.duration;
                break;
            case MessageAttachmentType.AUDIO:
                const audioUploadData = await getLinkAndDurationForAudio(files[0], bucketName);
                uploadUrl = audioUploadData.uploadUrl;
                duration = audioUploadData.duration;
                break;
            case MessageAttachmentType.DOCUMENT:
                const docUploadData = await getLinkForDocument(files[0], bucketName);
                uploadUrl = docUploadData.uploadUrl;
                break;
            default:
                throw new BadRequest('Invalid upload file type.');
        }

        data.attachment = {
            type,
            data: uploadUrl,
            thumbnail: thumbnailUrl === '' ? undefined : thumbnailUrl,
            metadata: {
                size,
                duration: duration ? duration : undefined,
            },
        };
    }
};

export default ValidateAttachment;
