import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { useRef, useMemo, useCallback, useEffect, useState } from "react";
import { View, TextInput, FlatList } from "react-native";
import DatabaseService from "../services/DatabaseService";
import { debounce } from "lodash";
import SearchedMessageList from "./SearchedMessageList";

const ChatSearchBottomSheet = ({ bottomSheetRef }) => {
  // variables
  const snapPoints = useMemo(() => ["70%", "50"], []);

  //   const [searchingWord, setSearchingWord] = useState();

  const [searchingResult, setSearchingResult] = useState([]);

  const handleSheetChanges = useCallback((index) => {
    console.log("handleSheetChanges", index);
  }, []);

  const handleSheetEnd = useCallback(() => {
    bottomSheetRef.current.close();
    console.log("The bottom sheet is now closed", bottomSheetRef.current);
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

  const onSearchHandler = debounce(async (keyword) => {
    try {
      const result = await DatabaseService.Inst.searchChatHistory(keyword);
      setSearchingResult(result);
      console.log("search result: ", result);
    } catch (e) {
      console.log("search error");
    }
  }, 500); // the search function will be called 500 ms after the user stops typing

  //   useEffect(() => {
  //     if (isSearchSheetOpen) {
  //       bottomSheetRef.current?.present(); // this will snap to the maximum provided point
  //     } else {
  //       bottomSheetRef.current?.close(); // this will slide down the sheet
  //     }
  //   }, [isSearchSheetOpen]);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={1} // 0 refers to the first snap point ('25%')
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      onChange={handleSheetChanges}
      //   onClose={handleSheetEnd}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: "#262F38" }}
      handleIndicatorStyle={{ backgroundColor: "white" }}
    >
      <View className="px-[20px] mt-[10px]">
        <View className="h-[30px]">
          <TextInput
            //   value={searchingWord}
            onChangeText={onSearchHandler}
            className="flex-1 bg-[#1B1B1B] rounded h-[100%] p-[5px] text-[#CACACA]"
            // onSubmitEditing={sendMessage}
            placeholder="Search chat history"
            placeholderTextColor="#CACACA"
          />
        </View>
        <View className="mt-[10px]">
          <FlatList
            data={searchingResult}
            renderItem={({ item }) => (
              <SearchedMessageList
                item={item}
                handleSheetEnd={handleSheetEnd}
              />
            )}
            keyExtractor={(item) => item.messageId}
          />
        </View>
      </View>
    </BottomSheetModal>
  );
};

export default ChatSearchBottomSheet;
