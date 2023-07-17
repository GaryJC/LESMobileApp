import IMUserInfo from "./IMUserInfo";

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

    updateTimelineId(timelineId) {
        if (timelineId > this.latestTimelineId) {
            this.latestTimelineId = timelineId;
        }
    }
}

export default ChatGroup;