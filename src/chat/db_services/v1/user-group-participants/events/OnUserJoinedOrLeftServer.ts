/**
 * Created By Soumya(soumya\@smartters.in) on 4/3/2023 at 3:59 PM.
 */
import {UserGroupParticipant_GET, UserGroupParticipantStatus} from "../interfaces/UserGroupParticipantInterface";
import {HookContext, ServiceAddons} from "@feathersjs/feathers";
import {Service} from "feathers-mongoose";
import {
    groupJoinPath,
    userGroupParticipantsPath,
    userGroupPath,
    userpath
} from "../../../../service_endpoints/services";
import {User_GET} from "../../user/interfaces/UserInterfaces";
import {UserGroup_GET, UserGroupStatus, UserGroupType} from "../../user-group/interfaces/UserGroupInterface";
import {Join} from "../../../../services/v1/chat/group-chat/join/join.class";
import {UserGroupParticipants} from "../user-group-participants.class";

const OnUserJoinedOrLeftServer = async (result: UserGroupParticipant_GET, context: HookContext) => {
    const { app, data, params } = context;
    const { status } = data;
    if (!status) return context;

    const { group, participant } = result;
    const { user } = params;
    if (!user) return context;

    const groupService: Service & ServiceAddons<any> = app.service(userGroupPath);
    const userService: Service & ServiceAddons<any> = app.service(userpath);
    const groupJoinService: Join & ServiceAddons<any> = app.service(groupJoinPath);
    const userGroupParticpantService: UserGroupParticipants & ServiceAddons<any> = app.service(userGroupParticipantsPath);

    const userData = user as User_GET;
    const groupData: UserGroup_GET = 'name' in group ? group : await groupService._get(group.toString());
    const participantData: User_GET =
        'name' in participant ? participant : await userService._get(participant.toString());

    if (!groupData.isTeam) return context;

    if (status === UserGroupParticipantStatus.ACTIVE){
        const publicChannels = await groupService._find({
            query: {
                type: UserGroupType.PUBLIC_GROUP_CHAT,
                isTeam: false,
                parentId: groupData._id,
                status: UserGroupStatus.ACTIVE,
                $select: ['_id'],
            },
            paginate: false,
        });
        for (const each of publicChannels) {
            await groupJoinService.create({
                group: groupData._id.toString(),
            }, {
                query: {},
                user: participantData,
            })
        }
    } else if (status === UserGroupParticipantStatus.LEFT) {
        const allChannels: Array<UserGroup_GET> = await groupService._find({
            query: {
                isTeam: false,
                parentId: groupData._id,
                status: UserGroupStatus.ACTIVE,
                $select: ['_id'],
            },
            paginate: false,
        });

        const userParticipants: Array<UserGroupParticipant_GET> = await userGroupParticpantService._find({
            query: {
                status: UserGroupParticipantStatus.ACTIVE,
                group: {
                    $in: allChannels.map((e) => e._id),
                },
                participant: participantData._id,
                $select: ['_id'],
            }
        });

        for (const each of userParticipants) {
            await groupJoinService.remove(each._id.toString(), {
                query: {},
                user: participantData
            })
        }
    }
};

export default OnUserJoinedOrLeftServer;
