class UserSetting {
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

}

export default UserSetting;