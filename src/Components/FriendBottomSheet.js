import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { View, Text, ImageBackground, Image } from "react-native";
import { useRef, useCallback, useMemo, useEffect } from "react";

export default function FriendBottomSheet({
  isSheetOpen,
  setIsSheetOpen,
  selectedFriend,
}) {
  const snapPoints = useMemo(() => ["80%", "60%"]);
  const bottomSheetRef = useRef(null);
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

  const handleSheetChanges = useCallback((index) => {
    console.log("handleSheetChanges", index);
  }, []);

  const handleSheetEnd = useCallback(() => {
    console.log("The bottom sheet is now closed");
    setIsSheetOpen(false);
  }, []);

  useEffect(() => {
    if (isSheetOpen) {
      bottomSheetRef.current?.expand(); // this will snap to the maximum provided point
    } else {
      bottomSheetRef.current?.close(); // this will slide down the sheet
    }
  }, [isSheetOpen]);

  useEffect(() => {
    console.log("selected friend: ", selectedFriend);
  }, [selectedFriend]);

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
      handleIndicatorStyle={{ backgroundColor: "white" }}
      //   handleStyle={{ display: "none" }}
    >
      <View>
        <ImageBackground
          source={require("../../assets/img/userBg.jpg")}
          className="h-[25vh] items-center relative"
        >
          <Image
            source={{
              uri: `https://i.pravatar.cc/?img=${selectedFriend?.id}`,
            }}
            className="w-[100px] h-[100px] rounded-full absolute bottom-[-50px] left-[25px]"
          />
        </ImageBackground>
      </View>
      <View className="mt-[55px] ml-[20px] flex-row items-end">
        <Text className="text-white font-bold text-[18px]">
          {selectedFriend?.name}
        </Text>
        <Text className="text-white font-bold pl-[5px]">
          #{selectedFriend?.id}
        </Text>
      </View>
    </BottomSheet>
  );
}
