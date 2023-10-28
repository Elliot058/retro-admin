/**
 * Created By Soumya(soumya@smartters.in) on 1/6/2023 at 2:56 PM.
 */
import { HookContext } from '@feathersjs/feathers';
import { Message_POST, MessageAttachmentType } from '../interfaces/MessageInterface';

/**
 * Create thumbnail for image and video messages.
 * @constructor
 */
const CreatThumbnail = () => async (context: HookContext) => {
    const { data } = context;
    const { attachment } = data as Message_POST;

    if (attachment) {
        const { type, data } = attachment;
        if (type === MessageAttachmentType.IMAGE) {
            attachment.thumbnail = data;
        } else if (type === MessageAttachmentType.VIDEO) {
            attachment.thumbnail = data;
        }
    }
};

export default CreatThumbnail;
