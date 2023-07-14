import { View, Text, TouchableOpacity } from "react-native";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { LesConstants, LesPlatformCenter } from "les-im-components";
import { StateIndicator, makeStateReadable } from "./StateIndicator";

export default function StatusBottomSheet({
  isSheetOpen,
  closeSheet,
  setUserStatus,
}) {
  const snapPoints = useMemo(() => ["30%"], []);
  const bottomSheetRef = useRef(null);

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

  useEffect(() => {
    if (isSheetOpen) {
      bottomSheetRef.current?.expand(); // this will snap to the maximum provided point
    } else {
      bottomSheetRef.current?.close(); // this will slide down the sheet
    }
  }, [isSheetOpen]);

  /**
   * 切换状态
   * @param {number} state
   */
  const switchStatusHandler = (state) => {
    // console.log(status);
    LesPlatformCenter.IMFunctions.setState(state)
      .then((code) => {
        console.log("状态设置成功");
        // const readableState = makeStateReadable(state);
        // console.log("ssa: ", readableState);
        setUserStatus(state);
        closeSheet();
      })
      .catch((code) => {
        console.log(`状态设置失败: ${code.toString(16)}`);
      });
  };

  const StatusButton = ({ state }) => (
    <View className="border-b-2 border-[#5C5C5C] py-[10]">
      <TouchableOpacity onPress={() => switchStatusHandler(state)}>
        <View className="flex-row items-center justify-between">
          <Text className="text-white text-[16px] font-bold">
            {makeStateReadable(state)}
          </Text>
          <StateIndicator state={state} />
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1} // 0 refers to the first snap point ('25%')
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      onChange={handleSheetChanges}
      onClose={handleSheetEnd}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: "#262F38" }}
    >
      <View className="flex-1 px-[30] py-[10]">
        <StatusButton state={LesConstants.IMUserState.Online} />
        <StatusButton state={LesConstants.IMUserState.Busy} />
        <StatusButton state={LesConstants.IMUserState.Away} />
        <StatusButton state={LesConstants.IMUserState.Hiding} />
      </View>
    </BottomSheet>
  );
}
