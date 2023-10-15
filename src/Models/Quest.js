import { LesConstants } from "les-im-components";
import DataCenter from "../modules/DataCenter";
import { Text, View } from "react-native";
import JSEvent from "../utils/JSEvent";
import { DataEvents } from "../modules/Events";

const { IMNotificationType, IMNotificationState } = LesConstants;

const EntryTemplateType = {
    NexGamiLoginDaily: 1,
    NexGamiReferNewUsers: 2,
    NexGamiAddFriends: 3,
    NexGamiSendMessage: 4,
    TwitterFollow: 5,
    TwitterRetweet: 6,
    TwitterQuote: 7,

    DiscordJoin: 31,

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
     * @type {Map<number,QuestEntryData>}
     */
    entries;

    getRewardPoints() {
        let points = 0;
        for (const id in this.entries) {
            const entry = this.entries[id];
            points += entry.rewardPoints;
        }
        return points;
    }
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

    /**
     * 
     * @param {number} index 
     * @returns {QuestEntryParamData}
     */
    getParam(index) {
        if (index < this.params.length) {
            return this.params[index];
        }
        return null;
    }

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

        switch (this.templateId) {
            case EntryTemplateType.TwitterFollow:
            case EntryTemplateType.TwitterRetweet:
                return this.#getTwitterTitle();
            case EntryTemplateType.TwitterQuote:
                return this.#getQuoteTweetTitle();
            case EntryTemplateType.DiscordJoin:
                return this.#getDiscordTitle();
        }

        return <Text className=" text-white text-[16px]">{t}</Text>;
    }

    #getDiscordTitle() {
        return this.#replaceParamToName(1);
    }

    #getTwitterTitle() {
        return this.#replaceParamToName(0, "@");
    }

    #getQuoteTweetTitle() {
        return this.#replaceParamToName(1, "@");
    }


    #replaceParamToName(paramIndex, prefix = "") {
        let t = this.title;
        const idx = t.indexOf(`%param${paramIndex}%`);
        if (idx == -1) {
            return <Text className="text-clr-light text-[16px]">{t}</Text>
        }
        const ts = t.slice(0, idx);
        const te = t.slice(idx + 8, t.length);

        return <View className="flex flex-row">
            <Text className="text-clr-light text-[16px]">{ts}</Text>
            <Text className="text-clr-link font-bold text-[16px]">{prefix}{this.params[paramIndex].paramValue}</Text>
            <Text className="text-clr-light text-[16px]">{te}</Text>
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
     * @type {boolean}
     */
    rewardClaimed;

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

class QuestUserData {
    /**
     * @type {number}
     */
    userId;
    /**
     * @type {number}
     */
    rewardPoints;
    /**
     * @type {number[]}
     */
    participateQuests;

    /**
     * @type {number[]}
     */
    endedQuests;

    /**
     * 更新现有user数据
     * @param {QuestUserData} userData 
     */
    update(userData) {
        const { rewardPoints, participateQuests, endedQuests } = userData;
        if (rewardPoints != null) {
            this.rewardPoints = rewardPoints;
        }
        if (participateQuests != null) {
            this.participateQuests = participateQuests;
        }
        if (endedQuests != null) {
            this.endedQuests = endedQuests;
        }

        JSEvent.emit(DataEvents.User.QuestUser_Updated);
    }

    /**
     * 
     * @param {QuestRewardType} type 
     * @param {number} value 
     */
    addReward(type, value) {
        if (type == QuestRewardType.Point) {
            this.rewardPoints += value;
        }
        JSEvent.emit(DataEvents.User.QuestUser_Updated);
    }

}

const QuestRewardType = {
    Point: 0,
    Token: 1,
}

class QuestRewardData {
    questId;
    /**
     * @type {QuestRewardItem[]}
     */
    #rewards = [];

    /**
     * 
     * @param {QuestRewardType} type 
     * @param {number} amount 
     * @param {number} total 
     */
    addReward(type, amount, total) {
        const item = new QuestRewardItem();
        item.type = type;
        item.amount = amount;
        item.total = total;
        this.#rewards.push(item);
    }

    /**
     * @type {QuestRewardItem[]}
     */
    get rewards() {
        return [...this.#rewards];
    }

}

class QuestRewardItem {
    /**
     * @type {QuestRewardType}
     */
    type;
    /**
     * @type {number}
     */
    amount;
    /**
     * @type {number}
     */
    total;
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

export {
    QuestUserData, QuestData, QuestEntryData, QuestEntryParamData, CommunityData,
    QuestUserProgress, QuestUserEntryProgress, QuestRewardData, QuestRewardItem,
    QuestRewardType, EntryTemplateType, hasProgress
}