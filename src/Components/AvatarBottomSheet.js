import CommonBottomSheetModal from "./CommonBottomSheetModal";
import { View, Text, FlatList, Image } from "react-native";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";

const AvatarBottomSheet = ({ visible, onClosed }) => {
  const data = [];
  for (let i = 1; i <= 9; i++) {
    data.push(`../../assets/img/avatar/avatar_${i}.png`);
    data.push(`../../assets/img/avatar/avatar_${i}.png`);
  }

  return (
    <CommonBottomSheetModal
      visible={visible}
      onClosed={onClosed}
      snapPoints={["75%"]}
      index={0}
    >
      <View className="flex-1 items-center">
        <FlatList
          data={data}
          numColumns={4}
          renderItem={({ item, index }) => <Avatar />}
          scr
        />
      </View>
    </CommonBottomSheetModal>
  );
};

const Avatar = () => {
  return (
    <Image
      source={require("../../assets/img/avatar/avatar_1.png")}
      className="rounded-full w-[70px] h-[70px] m-[10px]"
    />
  );
};
export default AvatarBottomSheet;
