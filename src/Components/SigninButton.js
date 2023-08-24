import { TouchableHighlight, View, Text } from "react-native";
import Constants from "../modules/Constants";

const SigninButton = ({ socialType, handler }) => {
  let title;
  let icon;
  let color;

  switch (socialType) {
    case Constants.SigninButtonType.Twitter:
      [title, icon, color] = ["Twitter", "", "#3FA3E7"];
      break;

    case Constants.SigninButtonType.Google:
      [title, icon, color] = ["Google", "", "#FFFFFF"];
      break;
    case Constants.SigninButtonType.Email:
      [title, icon, color] = ["Email", "", "#E03A34"];
      break;
  }

  return (
    <TouchableHighlight onPress={handler} className="mb-[10px]">
      <View
        style={{ backgroundColor: color }}
        className="w-[65vw] h-[40px] justify-center rounded"
      >
        <Text>Sign in with {title}</Text>
      </View>
    </TouchableHighlight>
  );
};

export default SigninButton;
