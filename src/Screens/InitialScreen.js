import { View, Image, ActivityIndicator } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useEffect } from "react";

export default function InitialScreen({}) {
  // const route = useRoute();
  // const navigation = useNavigation();
  // const { isLoading } = route.params;

  // useEffect(() => {
  //   console.log("isLoading: ", isLoading);
  //   if (!isLoading) {
  //     // navigation.navigate("BottomTab");
  //   }
  // }, [isLoading]);

  return (
    <View className="flex-1 justify-center items-center bg-[#080F14]">
      <Image
        className="w-[250] h-[250]"
        source={require("../../assets/img/logo_les.png")}
      />
      <ActivityIndicator className="mt-[50px]" size="large" color="#9176F7" />
    </View>
  );
}
