import { View, Text, TouchableHighlight, TouchableOpacity } from "react-native";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";

export default function StatusBottomSheet({
  isSheetOpen,
  setIsSheetOpen,
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
    setIsSheetOpen(false);
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

  const switchStatusHandler = (status) => {
    setUserStatus(status);
    console.log(setUserStatus);
    // console.log(status);
  };

  const StatusButton = ({ status }) => (
    <View className="border-b-2 border-[#5C5C5C] py-[10]">
      <TouchableOpacity onPress={() => switchStatusHandler(status)}>
        <Text className="text-white text-[16px] font-bold">{status}</Text>
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
        <StatusButton status="Online" />
        <StatusButton status="Busy" />
        <StatusButton status="Away" />
        <StatusButton status="Hiding" />
      </View>
    </BottomSheet>
  );
}
