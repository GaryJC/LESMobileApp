import { LesConstants } from "les-im-components";
import DatabaseService from "../services/DatabaseService";
const { IMPrivacyScope } = LesConstants;
class UserSetting {

    /**
     * 配置是否改变
     * @type {boolean}
     */
    changed;

    /**
     * @type {"small"|”medium"|"large"}
     */
    fontSetting = "”medium";

    chatFontSize = {
        small: 12,
        medium: 14,
        large: 18
    };

    chatTitleSize = {
        small: 18,
        medium: 20,
        large: 24
    }

    getChatFontSize() {
        if (this.chatFontSize[this.fontSetting] == null) {
            return this.chatFontSize["medium"];
        }
        return this.chatFontSize[this.fontSetting];
    }

    getChatTitleSize() {
        if (this.chatTitleSize[this.fontSetting] == null) {
            return this.chatTitleSize["medium"];
        }
        return this.chatTitleSize[this.fontSetting];
    }

    notificationSetting = {
        friendRequest: true,
        groupInvite: true,
        chatMessages: true,
        showMessageDetail: true,
    }

    privacySetting = {
        profileScope: IMPrivacyScope.Public,
    }

    updateNotificationSetting(setting) {
        this.changed = this.#notificationEquals(this.notificationSetting, setting);
        this.notificationSetting = setting;
    }

    updatePrivacySetting(setting) {
        this.changed = this.#privacyEquals(this.privacySetting, setting);
        this.privacySetting = setting;
    }

    #notificationEquals(n1, n2) {
        if (n1 == null || n2 == null) return false;
        if (n1.friendRequest != n2.friendRequest) return false;
        if (n1.groupInvite != n2.groupInvite) return false;
        if (n1.chatMessages != n2.chatMessages) return false;
        if (n1.showMessageDetail != n2.showMessageDetail) return false;
        return true;
    }

    #privacyEquals(p1, p2) {
        if (p1 == null || p2 == null) return false;
        if (p1.privacySetting != p2.privacySetting) return false;
        return true;
    }

}

export default UserSetting;