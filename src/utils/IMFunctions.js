import { LesPlatformCenter, LesConstants } from "les-im-components";

const websocket = "ws://15.222.78.167:19888/im/ws";

const IMFunctions = {
  connectIMServer: async (accountId, token, deviceId) => {
    console.log("para: ", accountId, token, LesConstants.IMDevices[deviceId]);
    return await LesPlatformCenter.Inst.connect(
      websocket,
      // accountId,
      // token,
      // LesConstants.IMDevices[deviceId],
      // 1,
      // "fabf6210-a7b2-4e99-9e2b-4d289d9fa0ef",
      17,
      "1468fbe7-82c7-48ec-8622-a50bc929e18c",
      1
    );
  },

  setName: async (username) => {
    console.log("username: ", username);
    return await LesPlatformCenter.IMFunctions.setName(username);
  },
};

export default IMFunctions;
