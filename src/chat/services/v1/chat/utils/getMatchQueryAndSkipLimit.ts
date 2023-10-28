/**
 * Created By Soumya(soumya@smartters.in) on 2/22/2023 at 2:03 PM.
 */
import { User_GET } from '../../../../db_services/v1/user/interfaces/UserInterfaces';
import { Application } from '@feathersjs/feathers';
import { Types } from 'mongoose';
import GetSkipValue from './getSkipValue';

/**
 * Get match query skip limit for messages of the chat.
 * @param id
 * @param $skip
 * @param $limit
 * @param upSkip
 * @param downSkip
 * @param userData
 * @param app
 * @param groupId
 */
const getMatchQueryAndSkipLimit = async ({
    id,
    $skip,
    $limit,
    upSkip,
    downSkip,
    userData,
    app,
    groupId,
}: {
    id?: number;
    $skip: number;
    $limit: number;
    upSkip?: string;
    downSkip?: string;
    userData: User_GET;
    app: Application;
    groupId: string;
}) => {
    let $orMatchArray: any = [];
    let limit = $limit;
    let skip: any = $skip;
    let messageSortValue: any = -1;
    if (id) {
        if (upSkip) {
            $orMatchArray = [
                {
                    'message._id': {
                        $lte: new Types.ObjectId(id),
                    },
                },
            ];
            skip = parseInt(upSkip);
            messageSortValue = -1;
        } else if (downSkip) {
            $orMatchArray = [
                {
                    'message._id': {
                        $gte: new Types.ObjectId(id),
                    },
                },
            ];
            skip = parseInt(downSkip);
            messageSortValue = 1;
        } else {
            $orMatchArray = [
                {
                    'message._id': {
                        $lte: new Types.ObjectId(id),
                    },
                },
                {
                    'message._id': {
                        $gte: new Types.ObjectId(id),
                    },
                },
            ];
            limit = 20;
            skip = await GetSkipValue(new Types.ObjectId(id), userData, app, groupId);
            messageSortValue = 1;
        }
    } else {
        $orMatchArray = [
            {
                'message._id': {
                    $ne: null,
                },
            },
        ];
    }

    return {
        skip: skip,
        limit: limit,
        messageSortValue: messageSortValue,
        $orMatchArray: $orMatchArray,
    };
};

export default getMatchQueryAndSkipLimit;
