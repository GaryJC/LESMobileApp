import { View, Text, TouchableOpacity } from "react-native";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { LesConstants, LesPlatformCenter } from "les-im-components";
import IMUserInfoService from "../services/IMUserInfoService";
import { FontAwesome5 } from "@expo/vector-icons";
import { TouchableHighlight } from "react-native-gesture-handler";
import ChatGroupService from "../services/ChatGroupService";

export default function GroupRoleBottomSheet({ bottomSheetModalRef }) {
  const snapPoints = useMemo(() => ["27.5%", "40%"]);
  // const bottomSheetRef = useRef(null);

  // callbacks
  const handleSheetChanges = useCallback((index) => {
    console.log("handleSheetChanges", index);
  }, []);

  const handleSheetEnd = useCallback(() => {
    console.log("The bottom sheet is now closed");
    closeSheet();
  }, []);

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );

  /**
   * 切换状态
   * @param {number} state
   */
  const changeRoleHandler = (state) => {};

  const RoleButton = ({ role }) => (
    <View className="border-b-2 border-[#5C5C5C] py-[10]">
      <TouchableOpacity onPress={() => changeRoleHandler(role)}>
        <View className="flex-row items-center justify-between">
          <Text className="text-white text-[16px] font-bold">
            {role === LesConstants.IMGroupMemberRole.Creator
              ? "Creator"
              : role === LesConstants.IMGroupMemberRole.Manager
              ? "Manager"
              : "Member"}
          </Text>
          <FontAwesome5
            name={
              role === LesConstants.IMGroupMemberRole.Creator
                ? "chess-king"
                : role === LesConstants.IMGroupMemberRole.Manager
                ? "chess-knight"
                : "chess-pawn"
            }
            size={22}
            color="white"
          />
        </View>
      </TouchableOpacity>
    </View>
  );

  const removeGroupMemberHandler = () => {
    // ChatGroupService.Inst.removeGroupMember()
  };

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0} // 0 refers to the first snap point ('25%')
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      onChange={handleSheetChanges}
      onClose={handleSheetEnd}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: "#262F38" }}
    >
      <View className="flex-1 px-[30] py-[10]">
        <Text className="text-white text-[18px] text-center font-bold mb-[10px]">
          Change role
        </Text>
        <RoleButton role={LesConstants.IMGroupMemberRole.Creator} />
        <RoleButton role={LesConstants.IMGroupMemberRole.Manager} />
        <RoleButton role={LesConstants.IMGroupMemberRole.Member} />
        <TouchableHighlight
          className="mt-[15%] w-[100%] h-[35px] overflow-hidden rounded-lg"
          onPress={removeGroupMemberHandler}
        >
          <View className="bg-[#131F2A] w-[100%] h-[100%] justify-center ">
            <Text className="text-[#FF0000] text-[17px] text-center">
              Remove
            </Text>
          </View>
        </TouchableHighlight>
      </View>
    </BottomSheetModal>
  );
}
