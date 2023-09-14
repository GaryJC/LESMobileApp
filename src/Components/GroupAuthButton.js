import { View, TouchableOpacity } from "react-native";
import { useRef } from "react";
import { LesConstants } from "les-im-components";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DataCenter from "../modules/DataCenter";
import GroupRoleBottomSheet from "../Components/GroupRoleBottomSheet";

const GroupAuthButton = ({ ownRole, groupId, userData }) => {
  const bottomSheetModalRef = useRef(null);

  const openChangeRoleSheet = () => {
    bottomSheetModalRef.current?.present();
  };

  // 如果这个是用户自己，不显示
  // 如果用户是creator, 那么除了自己都显示
  // 如果用户是manager，那么只显示members
  // 如果用户是member那么都不显示
  if (userData.id === DataCenter.userInfo.accountId) {
    return null;
  }
  if (ownRole === LesConstants.IMGroupMemberRole.Member) {
    return null;
  } else if (
    ownRole === LesConstants.IMGroupMemberRole.Manager &&
    userData.memberRole !== LesConstants.IMGroupMemberRole.Member
  ) {
    return null;
  } else {
    return (
      <View className="justify-center items-center">
        <TouchableOpacity onPress={openChangeRoleSheet}>
          <MaterialCommunityIcons name="account-key" size={24} color="white" />
        </TouchableOpacity>
        <GroupRoleBottomSheet
          bottomSheetModalRef={bottomSheetModalRef}
          memberData={userData}
          groupId={groupId}
        />
      </View>
    );
  }
};

export default GroupAuthButton;
