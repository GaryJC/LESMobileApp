import ChatGroup from "../Models/ChatGroup";
import MessageData from "../Models/MessageData";
import { CommunityData, QuestData, QuestEntryData, QuestEntryParamData, QuestUserData, QuestUserEntryProgress, QuestUserProgress } from "../Models/Quest";
import { SocialMediaBindInfo } from "../Models/UserProfile";
import Constants from "../modules/Constants";

const PBUtils = {
    /**
      * @param {PBLesIMTimelineData} timelineData
      * @returns {MessageData}
      */
    pbTimelineDataToMessageData(timelineData) {
        const timelineId = timelineData.getTimelineid();
        const senderId = timelineData.getSenderid();
        const recipientId = timelineData.getRecipientid();
        const messageId = timelineData.getMessageid();
        const content = timelineData.getContent();
        const messageType = timelineData.getMessagetype();
        const groupId = timelineData.getGroupid();
        const contentType = timelineData.getContenttype();
        const timestamp = timelineData.getTimestamp();

        // 信息的投递状态
        let status =
            timelineId == 0
                ? Constants.deliveryState.delivering
                : Constants.deliveryState.delivered;

        const messageData = new MessageData();
        messageData.messageId = messageId;
        messageData.senderId = senderId;
        messageData.recipientId = recipientId;
        messageData.timelineId = timelineId;
        messageData.content = content;
        messageData.status = status;
        messageData.messageType = messageType;
        messageData.groupId = groupId;
        messageData.contentType = contentType;
        messageData.timestamp = timestamp;

        return messageData;
    },

    /**
     * 
     * @param {LesIMChatGroupData} chatGroupData 
     * @returns {ChatGroup}
     */
    pbChatGroupDataToChatGroup(chatGroupData) {
        const cg = new ChatGroup();
        cg.id = chatGroupData.getGroupid();
        cg.name = chatGroupData.getName();
        cg.desc = chatGroupData.getDesc();
        cg.creator = chatGroupData.getCreator();
        cg.createTime = chatGroupData.getCreatetime();
        cg.iconId = chatGroupData.getIconid();
        return cg;
    },

    /**
     * 
     * @param {PBLesQuestData} questPb 
     * @returns {QuestData}
     */
    pbQuestDataToQuestData(questPb) {
        const qd = new QuestData();
        qd.questId = questPb.getQuestid();
        qd.questName = questPb.getQuestname();
        qd.startTime = questPb.getStarttime();
        qd.conmmuityId = questPb.getCommunityid();
        qd.endTime = questPb.getEndtime();
        var entries = questPb.getEntriesList();
        var es = entries.map(e => this.pbEntryDataToEntryData(e));
        qd.entries = es;
        return qd;
    },

    /**
     * 
     * @param {PBLesQuestEntryData} entryPb 
     * @returns {QuestEntryData}
     */
    pbEntryDataToEntryData(entryPb) {
        const e = new QuestEntryData();
        e.entryId = entryPb.getEntryid();
        e.templateId = entryPb.getTemplateid();
        e.title = entryPb.getTitle();
        e.categoryId = entryPb.getCategoryid();
        e.rewardPoints = entryPb.getRewardpoints();
        e.autoVerify = entryPb.getAutoverify();
        var ps = entryPb.getParamsList().map(p => this.pbEntryParamToData(p));
        e.params = ps;
        return e;
    },

    pbEntryParamToData(pb) {
        const p = new QuestEntryParamData();
        p.paramTitle = pb.getParamtype();
        p.paramTitle = pb.getParamtitle();
        p.paramValue = pb.getParamvalue();
        return p;
    },

    pbQuestProgressToData(pb) {
        const p = new QuestUserProgress();
        p.questId = pb.getQuestid();
        p.userId = pb.getUserid();
        p.rewardClaimed = pb.getRewardclaimed();
        pb.getProgressesList().map(pp => {
            var ep = this.pbQuestEntryProgressToData(pp);
            p.progress[ep.entryId] = ep;
        });
        return p;
    },

    /**
     * 
     * @param {LesQuestEntryProgress} pb 
     * @returns {QuestUserEntryProgress}
     */
    pbQuestEntryProgressToData(pb) {
        const p = new QuestUserEntryProgress();
        p.entryId = pb.getEntrytid();
        p.completed = pb.getCompleted();
        pb.getRecordsList().map(r => {
            const idx = r.getParamindex();
            const record = r.getRecord();
            p.records[idx] = record;
        });
        return p;
    },

    /**
     * 
     * @param {PBLesCommunityData} comPb 
     * @returns {CommunityData}
     */
    pbCommunityDataToData(comPb) {
        const c = new CommunityData();
        c.communityId = comPb.getCommunityid();
        c.name = comPb.getName();
        c.introduction = comPb.getIntroduction();
        c.email = comPb.getEmail();
        c.twitter = comPb.getTwitter();
        c.discord = comPb.getDiscord();
        c.logoUrl = comPb.getLogourl();
        c.verified = comPb.getVerified();
        c.createTime = comPb.getCreatetime();
        return c;
    },

    pbQuestUserDataToData(pb) {
        const u = new QuestUserData();
        u.userId = pb.getUserid();
        u.rewardPoints = pb.getRewardpoints();
        u.participateQuests = pb.getParticipatequestsList();
        u.endedQuests = pb.getEndedquestsList();
        return u;
    },

    pbBindInfoToData(pb) {
        const b = new SocialMediaBindInfo();
        b.accountId = pb.getAccountid();
        b.mediaType = pb.getMediatype();
        b.socialId = pb.getSocialid();
        b.socialName = pb.getSocialname();
        b.timestamp = pb.getTimestamp();
        b.reconnectCd = pb.getReconnectcd();
        b.connect = pb.getConnect();
        return b;
    }
}

export default PBUtils;