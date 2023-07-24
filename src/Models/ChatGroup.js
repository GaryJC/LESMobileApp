import IMUserInfo from "./IMUserInfo";
import { LesConstants, LesPlatformCenter } from "les-im-components";

const { IMGroupMemberRole, IMGroupMemberState, IMUserState, IMUserOnlineState } = LesConstants;

const MemberUpdateDelay = 300000;
/**
 * 聊天群组，存储的是聊天群组的基本信息，和成员列表，不存储聊天记录
 */
class ChatGroup {
    /**
     * 群组id
     * @type {number}
     */
    id;
    /**
     * 群名称
     * @type {string}
     */
    name;
    /**
     * 群详情
     * @type {string}
     */
    desc;

    /**
     * 群创建者
     * @type {number}
     */
    creator;
    /**
     * 创建时间
     * @type {number}
     */
    createTime;

    /**
     * 图标id
     * @todo (还没实现)
     * @type {number}
     */
    iconId;

    /**
     * 最新的timelineId
     * @type {number}
     */
    latestTimelineId;

    /**
     * 组成员
     * @type {ChatGroupMember[]}
     */
    #members;

    /**
     * 上一次更新成员列表的时间
     * @type {number}
     */
    #lastMemberUpdateTime = 0;


    updateTimelineId(timelineId) {
        if (timelineId > this.latestTimelineId) {
            this.latestTimelineId = timelineId;
        }
    }

    /**
     * 
     * @returns {Promise<ChatGroupMember[]>}
     */
    #updateMembers() {
        return new Promise((resolve, reject) => {
            if (this.#lastMemberUpdateTime == 0 || Date.now() - this.#lastMemberUpdateTime > MemberUpdateDelay) {
                LesPlatformCenter.IMFunctions.getGroupMembers(this.id).then(list => {
                    var members = list.map((v) => {
                        const groupId = v.getGroupid();
                        const memberId = v.getMemberinfo().getId();
                        const memberName = v.getMemberinfo().getName();
                        const memberTag = v.getMemberinfo().getTag();
                        const memberState = v.getMemberstate();
                        const memberRole = v.getMemberrole();
                        const joinTime = v.getJointime();

                        const member = new ChatGroupMember();
                        member.set(groupId, memberId, memberName, memberTag, memberState, memberRole, joinTime);
                        return member;
                    });
                    this.#members = members;
                    resolve(this.#members);
                }).catch(e => {
                    reject(e);
                })
            } else {
                resolve(this.#members);
            }
        });
    }

    /**
     * 获取群组成员列表
     * 注：不要使用这个方法获取成员列表，要用ChatGroupService.Inst.getGroupMembers方法
     * @param {(state:IMGroupMemberState)=>boolean} stateFilter 状态过滤器，null表示获取全部状态
     * @returns {Promise<ChatGroupMember[]>}
     */
    getMembers(stateFilter) {
        return new Promise((resolve, reject) => {
            this.#updateMembers().then(members => {
                let ms = [];
                if (stateFilter == null) {
                    ms = members;
                } else {
                    ms = members.filter((v) => stateFilter(v))
                }
                resolve(ms);
            }).catch(err => reject(err));
        })
    }

}

class ChatGroupMember {
    /**
     * @type {number}
     */
    groupId;

    /**
     * @type {IMGroupMemberRole}
     */
    memberRole;

    /**
     * @type {IMGroupMemberState}
     */
    groupState;

    /**
     * @type {number}
     */
    jointTime;

    /**
     * @type {IMUserInfo}}
     */
    userInfo;

    set(groupId, userId, userName, userTag, memberState, memberRole, jointTime) {
        this.groupId = groupId;
        this.userInfo = new IMUserInfo(userId, userName, userTag, IMUserState.Online, IMUserOnlineState.Offline);
        this.memberState = memberState;
        this.memberRole = memberRole;
        this.jointTime = jointTime;
    }

}

export default ChatGroup;

export { ChatGroupMember }