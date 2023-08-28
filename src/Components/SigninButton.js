import { TouchableHighlight, View, Text, Image } from "react-native";
import Constants from "../modules/Constants";

const SigninButton = ({ socialType, handler }) => {
  let title;
  let icon;
  let color;

  switch (socialType) {
    case Constants.SigninButtonType.Twitter:
      [title, icon, color] = [
        "Twitter",
        require("../../assets/img/twitter.png"),
        "#3FA3E7",
      ];
      break;

    case Constants.SigninButtonType.Google:
      [title, icon, color] = [
        "Google",
        require("../../assets/img/google.png"),
        "#FFFFFF",
      ];
      break;
    case Constants.SigninButtonType.Email:
      [title, icon, color] = [
        "Email",
        require("../../assets/img/email.png"),
        "#E03A34",
      ];
      break;
  }

  return (
    <TouchableHighlight onPress={handler} className="mb-[15px]">
      <View
        style={{ backgroundColor: color }}
        className="w-[65vw] h-[40px] items-center rounded flex-row pl-[10px]"
      >
        <Image source={icon} className="w-[24px] h-[24px] mr-[10px]" />
        <Text
          className={
            title === "Google"
              ? "font-bold text-[#7D7D7D]"
              : "font-bold text-white"
          }
        >
          Sign in with {title}
        </Text>
      </View>
    </TouchableHighlight>
  );
};

export default SigninButton;
