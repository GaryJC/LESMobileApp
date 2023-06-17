import {
  View,
  Text,
  Image,
  ImageBackground,
  TouchableHighlight,
} from "react-native";
import DataCenter from "../modules/DataCenter";
import { LesConstants, LesPlatformCenter } from "les-im-components";

export default function InvitationList({ item }) {
  console.log("item: ", item);

  const onRespondHandler = (notificationId, response) => {
    LesPlatformCenter.IMFunctions.respondNotification(notificationId, response)
      .then((res) => {
        console.log("response: ", res);
      })
      .catch((e) => console.error(e));
  };

  const InviteFromSelf = ({ notificationId }) => (
    <View className="bg-[#131F2A] flex-row justify-between items-center">
      <View className="flex-row items-center">
        <Image
          source={{ uri: `https://i.pravatar.cc/?img=${item.sender.id}` }}
          className="w-[50px] h-[50px] rounded-full"
        />
        <Text className="text-white">{item.sender.name}</Text>
      </View>
      <View className="flex-row">
        <TouchableHighlight
          onPress={() =>
            onRespondHandler(
              notificationId,
              LesConstants.IMNotificationState.Canceled
            )
          }
        >
          <View>
            <Text className="text-white">Cancel</Text>
          </View>
        </TouchableHighlight>
      </View>
    </View>
  );

  const InvitFromOthers = ({ notificationId }) => (
    <View className="bg-[#131F2A] flex-row justify-between items-center">
      <View className="flex-row items-center">
        <Image
          source={{ uri: `https://i.pravatar.cc/?img=${item.sender.id}` }}
          className="w-[50px] h-[50px] rounded-full"
        />
        <Text className="text-white">{item.sender.name}</Text>
      </View>
      <View className="flex-row">
        <TouchableHighlight
          onPress={() =>
            onRespondHandler(
              notificationId,
              LesConstants.IMNotificationState.Accepted
            )
          }
        >
          <View>
            <Text className="text-white">Accept</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={() =>
            onRespondHandler(
              notificationId,
              LesConstants.IMNotificationState.Rejected
            )
          }
        >
          <View>
            <Text className="text-white">Reject</Text>
          </View>
        </TouchableHighlight>
      </View>
    </View>
  );

  return (
    <View className="w-[90vw] mx-auto">
      {item.sender.id === DataCenter.userInfo.accountId ? (
        <InviteFromSelf notificationId={item.id} />
      ) : (
        <InvitFromOthers notificationId={item.id} />
      )}
    </View>
  );
}
