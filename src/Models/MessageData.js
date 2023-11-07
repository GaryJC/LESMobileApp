import { LesConstants } from "les-im-components";
import Constants from "../modules/Constants";
const { deliveryState } = Constants;
const { IMMessageType, IMMessageContentType } = LesConstants;
export default class MessageData {
  /**
   * 消息id
   * @type {number}
   */
  messageId;
  /**
   * 发件人id
   * @type {number}
   */
  senderId;
  /**
   * 收件人id
   * @type {number}
   */
  recipientId;
  /**
   * 时间轴id
   * @type {number}
   */
  timelineId;
  /**
   * 正文
   * @type {string}
   */
  content;
  /**
   * 正文类型
   * @type {IMMessageContentType}
   */
  contentType;
  /**
   * 状态
   * @type {deliveryState}
   */
  status;

  /**
   * 消息类型
   * @type {IMMessageType}
   */
  messageType;
  /**
   * 群组id，群聊时生效
   * @type {number}
   */
  groupId;

  /**
   * 消息发送时间戳
   * @type {number}
   */
  timestamp;

}

