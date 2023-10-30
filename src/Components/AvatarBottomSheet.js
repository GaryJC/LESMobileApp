import CommonBottomSheetModal from "./CommonBottomSheetModal";
import { View, Text, FlatList, Image, ActivityIndicator, Pressable, Touchable, PlatformColor } from "react-native";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { useEffect, useState } from "react";
import axios from "axios";
import Constants from "../modules/Constants";
import API from "../modules/Api";
import Avatar from "./Avatar";
import DataCenter from "../modules/DataCenter";
import { TouchableHighlight } from "react-native-gesture-handler";
import { Ionicons } from '@expo/vector-icons';
import { LesPlatformCenter } from "les-im-components";

const AvatarBottomSheet = ({ visible, onClosed }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState(DataCenter.userInfo.imUserInfo.avatar);

  const loadIndex = async () => {
    setLoading(true);
    const resp = await axios.get(API.headerIndex());
    const headers = resp.data.split("\n");

    const urls = headers.filter(h => h != "");
    setData(["default", ...urls]);
    setLoading(false);
  }

  useEffect(() => {
    loadIndex();
  }, [])

  const onHeaderSelected = (header) => {
    console.log(header);
    setAvatar(header);
  }

  const onSheetOpen = () => {
    const avt = DataCenter.userInfo.imUserInfo.avatar == "" ? "default" : DataCenter.userInfo.imUserInfo.avatar;
    setAvatar(avt);
  }

  const onSheetClose = () => {
    LesPlatformCenter.IMFunctions.setAvatar(avatar).then(a => {
      console.log("avatar set successful", a);
    }).catch(e => {
      console.log("avatar set failed", e);
    })
    if (onClosed != null) {
      onClosed();
    }
  }

  return (
    <CommonBottomSheetModal
      visible={visible}
      onClosed={onSheetClose}
      onOpen={onSheetOpen}
      snapPoints={["80%"]}
      index={0}
      title="Avatar"
    >
      {
        loading && (<ActivityIndicator size={"large"} />)
      }
      <View className="flex-1 items-center pb-[30px]">
        <FlatList
          data={data}
          numColumns={4}
          renderItem={({ item, index }) => <AvatarItem
            header={item}
            selected={item == avatar}
            onPress={onHeaderSelected}
          />}
        />
      </View>
    </CommonBottomSheetModal>
  );
};

/**
 * 
 * @param {{header:string, selected:boolean, onPress:(header)=>void}} param0 
 * @returns 
 */
const AvatarItem = ({ header, selected, onPress }) => {
  return <View className="p-[5px] rounded-full" >
    <TouchableHighlight className="rounded-full p-[5px]"
      underlayColor="#F5FFCE"
      style={{ backgroundColor: selected ? '#5EFF57' : null }}
      onPress={() => {
        if (onPress != null) onPress(header);
      }}
    >{
        header == "default" || header == ""
          ? <Avatar name={DataCenter.userInfo.imUserInfo.name} size={{ w: 70, h: 70, font: 40 }} />
          : (
            <Image
              source={{ uri: API.headerUrl(header) }}
              className="rounded-full w-[70px] h-[70px]"
            />
          )}
    </TouchableHighlight>
    {
      selected && (<View className="w-[24px] h-[24px] rounded-full p-[2px] absolute right-[6px] bottom-[6px]" style={{ backgroundColor: '#5EFF57' }}>
        <Ionicons name="checkmark-done" size={20} color="black" />
      </View>)
    }
  </View>
};
export default AvatarBottomSheet;
