import {
  useBottomSheet,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { useRef, useMemo, useState, useCallback } from "react";
import { Text, View } from "react-native";

export function SelectBottomSheet({ bottomSheetRef, bottomSheetContent }) {
  const snapPoints = useMemo(() => ["25%"], []);

  const [selectedValue, setSelectedValue] = useState(null);

  //   const closeBottomSheet = () => {
  //     bottomSheetRef.current?.dismiss();
  //   };

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        // appearsOnIndex={0}
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetScrollView
        contentContainerStyle={{
          flex: 1,
          backgroundColor: "white",
          alignItems: "center",
        }}
      >
        <View className="mt-5">{bottomSheetContent}</View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
