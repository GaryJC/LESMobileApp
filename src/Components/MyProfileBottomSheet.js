import CommonBottomSheetModal from "./CommonBottomSheetModal";
import UserBottomSheetHeader from "./UserBottomSheetHeader";
import Links from "./UserDrawer/Links";
import DataCenter from "../modules/DataCenter";
import { View } from "react-native";
import ProfilePrivacy from "./UserDrawer/ProfilePrivacy";

const MyProfileBottomSheet = ({ visible, onClosed }) => {
  return (
    <View>
      <CommonBottomSheetModal
        visible={visible}
        onClosed={onClosed}
        closable={true}
        snapPoints={["85%"]}
        index={0}
      >
        <View className="flex-1">
          <UserBottomSheetHeader
            user={DataCenter.userInfo.imUserInfo}
            isOwn={true}
          />
          <View className="mx-[5%] mt-[3vh]">
            <Links />
            <ProfilePrivacy />
          </View>
        </View>
      </CommonBottomSheetModal>
    </View>
  );
};

export default MyProfileBottomSheet;
