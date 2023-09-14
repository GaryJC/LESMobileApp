import { LesPlatformCenter } from "les-im-components";
import { QuestData, QuestRewardData, QuestUserProgress } from "../Models/Quest";
import PBUtils from "../utils/PBUtils";
import DataCenter from "../modules/DataCenter";

class QuestService {
    static #inst;

    /**
     * @type {Map<number, QuestData>}
     */
    #questMap = {};

    #communityMap = {};

    /**
     * @returns {QuestService}
     */
    static get Inst() {
        return QuestService.#inst ?? new QuestService();
    }

    constructor() {
        if (new.target !== QuestService) return;
        if (QuestService.#inst == null) {
            QuestService.#inst = this;
        }
        return QuestService.#inst;
    }

    /**
     * 
     * @param {QuestUser} questId 
     * @returns {Promise<QuestUserProgress>}
     */
    getUserQuestProgress(questId) {
        return new Promise((resolve, reject) => {
            LesPlatformCenter.IMFunctions.getUserQuestProgress(questId).then(pb => {
                const p = PBUtils.pbQuestProgressToData(pb);
                resolve(p);
            }).catch(e => {
                reject(e);
            })
        })
    }

    /**
     * 获取指定id的任务信息
     * @param {number} questId 
     * @returns {Promise<QuestData>}
     */
    getQuestInfo(questId) {
        return new Promise((resolve, reject) => {
            if (this.#questMap[questId] != null) {
                resolve(this.#questMap[questId]);
            } else {
                LesPlatformCenter.IMFunctions.getQuestInfo(questId).then(questPb => {
                    const quest = PBUtils.pbQuestDataToQuestData(questPb);
                    this.#questMap[quest.questId] = quest;
                    resolve(quest);
                }).catch(e => {
                    reject(e);
                })
            }
        })
    }

    getCommunityInfo(communityId) {
        return new Promise((resolve, reject) => {
            if (this.#communityMap[communityId] != null) {
                resolve(this.#communityMap[communityId]);
            } else {
                LesPlatformCenter.IMFunctions.getCommunityInfo(communityId).then(comPb => {
                    const community = PBUtils.pbCommunityDataToData(comPb);
                    this.#communityMap[community.id] = community;
                    resolve(community);
                }).catch(e => {
                    reject(e);
                })
            }
        })
    }

    getQuestUserInfo() {
        return new Promise((resolve, reject) => {
            LesPlatformCenter.IMFunctions.getQuestUserData().then(pb => {
                const user = PBUtils.pbQuestUserDataToData(pb);
                resolve(user);
            }).catch(e => {
                reject(e);
            })
        })
    }

    /**
     * 
     * @param {number} questId 
     * @returns {Promise<QuestRewardData>}
     */
    claimReward(questId) {
        return new Promise((resolve, reject) => {
            LesPlatformCenter.IMFunctions.clamiQuestReward(questId).then(r => {
                const rewards = r.rewardPoints;
                const questReward = new QuestRewardData();
                questReward.questId = questId;
                rewards.map(r => {
                    questReward.addReward(r.getType(), r.getAmount(), r.getTotal());
                })

                questReward.rewards.forEach(r => {
                    DataCenter.userInfo.questUserInfo.addReward(r.type, r.amount);
                })

                resolve(questReward);
            }).catch(e => { reject(e) })
        })
    }

    async onUserLogin() {
        this.getQuestUserInfo().then(u => {
            DataCenter.userInfo.questUserInfo.update(u);
        })

        const q = await this.getQuestInfo();
    }

}

export default QuestService;