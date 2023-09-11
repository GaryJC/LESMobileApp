import { LesConstants } from "les-im-components";
import DataCenter from "../modules/DataCenter";
import { Text, View } from "react-native";

const { IMNotificationType, IMNotificationState } = LesConstants;

const EntryTemplateType = {
    NexGamiLoginDaily: 1,
    NexGamiReferNewUsers: 2,
    NexGamiAddFriends: 3,
    NexGamiSendMessage: 4,
    TwitterFollow: 5,
    TwitterRetweet: 6,
    TwitterTweet: 7,

}

class CommunityData {
    /**
     * id
     * @type {number}
     */
    communityId;

    /**
     * 社群名称
     * @type {string}
     */
    name;

    /**
     * 社群介绍
     * @type {string}
     */
    introduction;


    /**
     * 社群邮箱
     * @type {string}
     */
    email;


    /**
     * 社群twitter
     * @type {string}
     */
    twitter;

    /**
     * 社群discord
     * @type {string}
     */
    discord;


    /**
     * 社群logo地址
     * @type {string}
     */
    logoUrl;


    /**
     * 是否是官方认证社群
     * @type {boolean}
     */
    verified;

    /**
     * @type {number}
     */
    createTime;
}

class QuestData {
    /**
     * 任务id
     * @type {number}
     */
    questId;

    /**
     * 任务所属社群id
     * @type {number}
     */
    conmmuityId;

    /**
     * 任务名称
     * @type {string}
     */
    questName;

    /**
     * 任务起始时间
     * @type {number}
     */
    startTime;

    /**
     * 任务结束时间
     * @type {number}
     */
    endTime;

    /**
     * 任务项目数据
     * entryId → QuestEntryData
     * @type {{number:QuestEntryData}}
     */
    entries;
}

class QuestEntryData {
    /**
     * 项目id
     * @type {number}
     */
    entryId;

    /**
     * 项目模板id
     * @type {number}
     */
    templateId;

    /**
     * 项目标题
     * @type {string}
     */
    title;

    /**
     * 项目类别id
     * @type {number}
     */
    categoryId;

    /**
     * 项目奖励点数
     * @type {number}
     */
    rewardPoints;

    /**
     * 是否是自动验证的项目
     * 
     * 自动验证的项目不需要用户手动点击Verify，服务器自动验证
     * @type {number}
     */
    autoVerify;

    /**
     * 项目参数信息
     * @type {QuestEntryParamData[]}
     */
    params;

    // /**
    //  * 用户当前进度
    //  * @type {QuestUserEntryProgress}
    //  */
    // progress;


    /**
     * 返回当前Twitter的title
     */
    getEntryTitleDom() {
        let t = this.title;
        if (this.templateId == EntryTemplateType.TwitterFollow) {
            return this.#getTwitterTitle();
        }

        return <Text className="text-clr-light text-md">{t}</Text>;
    }

    #getTwitterTitle() {
        let t = this.title;
        const idx = t.indexOf("%param0%");
        if (idx == -1) {
            return <Text className="text-clr-light text-md">{t}</Text>
        }
        const ts = t.slice(0, idx);
        const te = t.slice(idx + 8, t.length);

        return <View className="flex flex-row">
            <Text className="text-clr-light text-md">{ts}</Text>
            <Text className="text-clr-link font-bold text-md">@{this.params[0].paramValue}</Text>
            <Text className="text-clr-light text-md">{te}</Text>
        </View>
    }

}

EntryParamType = {
    String: 0,
    Number: 1,
    Bool: 2,
    Tweet_Url: 3
}

class QuestEntryParamData {
    /**
     * 参数数据类型
     * @type {EntryParamType}
     */
    paramType;

    /**
     * 参数名称
     * @type {string}
     */
    paramTitle;
    /**
     * 参数值
     * @type {string}
     */
    paramValue;
}

class QuestUserProgress {
    /**
     * @type {number}
     */
    questId;

    /**
     * @type {number}
     */
    userId;

    /**
     * @type {{number:QuestUserEntryProgress}}
     */
    progress = {};

    /**
     * 
     * @param {number} entryId 
     * @return {QuestUserEntryProgress}
     */
    getEntryProgress(entryId) {
        return this.progress[entryId];
    }

}

class QuestUserEntryProgress {
    /**
     * @type {number}
     */
    entryId;
    /**
     * @type {boolean}
     */
    completed;
    /**
     * @type {{number:string}}
     */
    records = {};

    getRecord(index, defaultValue) {
        return this.records[index] ?? defaultValue;
    }
}

/**
 * 返回当前entry是否需要显示progress
 * @param {QuestEntryData} entry 
 */
const hasProgress = (entry) => {
    return entry.templateId == EntryTemplateType.NexGamiLoginDaily
        | entry.templateId == EntryTemplateType.NexGamiAddFriends
        | entry.templateId == EntryTemplateType.NexGamiReferNewUsers
        | entry.templateId == EntryTemplateType.NexGamiSendMessage
        ;
}

export { QuestData, QuestEntryData, QuestEntryParamData, CommunityData, QuestUserProgress, QuestUserEntryProgress, hasProgress }