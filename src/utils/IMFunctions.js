import { LesPlatformCenter, LesConstants } from "les-im-components";

const websocket = "ws://15.222.78.167:19888/im/ws";

const IMFunctions = {
  connectIMServer: async (accountId, token, deviceId) => {
    console.log("para: ", accountId, token, LesConstants.IMDevices[deviceId]);
    return await LesPlatformCenter.Inst.connect(
      websocket,
      accountId,
      token,
      LesConstants.IMDevices[deviceId]
    );
  },

  setName: async (username) => {
    console.log("username: ", username);
    return await LesPlatformCenter.IMFunctions.setName(username);
  },
};

export default IMFunctions;
