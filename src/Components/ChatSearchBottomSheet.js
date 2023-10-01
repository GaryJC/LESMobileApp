import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import { useRef, useMemo, useCallback, useEffect, useState } from "react";
import {
  View,
  TextInput,
  Text,
  FlatList,
  KeyboardAvoidingView,
  StyleSheet,
} from "react-native";
import DatabaseService from "../services/DatabaseService";
import { debounce } from "lodash";
import ChatSearchList from "./ChatSearchList";

const ChatSearchBottomSheet = ({ bottomSheetRef }) => {
  // variables
  const snapPoints = useMemo(() => ["70%"], []);

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
        // appearsOnIndex={0}
      />
    ),
    []
  );

  const onSearchHandler = debounce(async (keyword) => {
    console.log(keyword);
    if (keyword) {
      try {
        const result = await DatabaseService.Inst.searchChatHistory(keyword);
        setSearchingResult(result);
        console.log("search result: ", result);
      } catch (e) {
        console.log("search error");
      }
    }
  }, 500); // the search function will be called 500 ms after the user stops typing

  //   useEffect(() => {
  //     if (isSearchSheetOpen) {
  //       bottomSheetRef.current?.present(); // this will snap to the maximum provided point
  //     } else {
  //       bottomSheetRef.current?.close(); // this will slide down the sheet
  //     }
  //   }, [isSearchSheetOpen]);

  const temp = [0, 1, 2, 3];

  return (
    // <KeyboardAvoidingView>
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0} // 0 refers to the first snap point ('25%')
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      onChange={handleSheetChanges}
      //   onClose={handleSheetEnd}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: "#262F38" }}
      handleIndicatorStyle={{ backgroundColor: "white" }}
      keyboardBehavior="fillParent"
    >
      {/* <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : null}
      > */}
      <View className="px-[20px] mt-[10px] flex-1">
        <View className="h-[30px]">
          <TextInput
            //   value={searchingWord}
            onChangeText={onSearchHandler}
            className="flex-1 bg-[#1B1B1B] rounded h-[100%] p-[5px] text-[#CACACA]"
            // onSubmitEditing={sendMessage}
            placeholder="Search chat history"
            placeholderTextColor="#CACACA"
          />
          {/* <BottomSheetTextInput className="flex-1 bg-[#1B1B1B] rounded h-[100%] p-[5px] text-[#CACACA]" /> */}
        </View>
        <BottomSheetFlatList
          data={searchingResult}
          renderItem={({ item }) => (
            <ChatSearchList item={item} handleSheetEnd={handleSheetEnd} />
          )}
          keyExtractor={(item) => item.messageId}
        />
      </View>
      {/* </KeyboardAvoidingView> */}
    </BottomSheetModal>
    // </KeyboardAvoidingView>
  );
};

export default ChatSearchBottomSheet;
