class Message {
  // 发送信息人的头像和名字缓存？
  constructor(
    messageId,
    messageSenderName,
    messageSenderAvatar,
    messageContent,
    messageDate
  ) {
    this.messageId = messageId;
    this.messageSenderName = messageSenderName;
    this.messageSenderAvatar = messageSenderAvatar;
    this.messageContent = messageContent;
    this.messageDate = messageDate;
  }
}

export default Message;
