import { View, TouchableHighlight } from "react-native";
import NotificationService from "../services/NotificationService";
import { MaterialIcons } from "@expo/vector-icons";

const FriendAddButton = ({ userData, setIsLoading }) => {
  const addFriendHandler = async () => {
    setIsLoading(true);
    console.log(userData);
    try {
      await NotificationService.Inst.sendFriendInvitation(userData.id);
      console.log("send friend invite success: ", userData);
    } catch (e) {
      console.log("send friend invit error: ", e);
    }
    setIsLoading(false);
  };

  return (
    <TouchableHighlight onPress={addFriendHandler} className="justify-center">
      <View className="">
        <MaterialIcons name="person-add-alt-1" size={24} color="white" />
      </View>
    </TouchableHighlight>
  );
};

export default FriendAddButton;
