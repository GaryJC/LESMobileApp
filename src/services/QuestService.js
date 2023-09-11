import { LesPlatformCenter } from "les-im-components";
import { QuestData, QuestUserProgress } from "../Models/Quest";
import PBUtils from "../utils/PBUtils";

class QuestService {
    static #inst;

    #questMap = [];

    #communityMap = [];

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

    async onUserLogin() {
        const q = await this.getQuestInfo();
        console.log(q);
    }

}

export default QuestService;