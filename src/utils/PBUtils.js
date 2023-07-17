import ChatGroup from "../Models/ChatGroup";
import MessageData from "../Models/MessageData";
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
    pbChatGroupDataToChatGroup(chatGroupData){
        const cg = new ChatGroup();
        cg.id = chatGroupData.getGroupid();
        cg.name = chatGroupData.getName();
        cg.desc = chatGroupData.getDesc();
        cg.creator = chatGroupData.getCreator();
        cg.createTime = chatGroupData.getCreatetime();
        cg.iconId = chatGroupData.getIconid();
        return cg;
    }
}

export default PBUtils;