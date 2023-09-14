import { View, Text, TouchableHighlight, Image } from "react-native";
import { ActivityIndicator } from "react-native";

const colorTable = {
  normal: {
    bg: "#393B44",
    fg: "#547AD5",
  },
  primary: {
    bg: "#4C89F9",
    fg: "#ffffff",
  },
  danger: {
    bg: "#FF3300",
    fg: "#ffffff",
  },
  disabled: {
    bg: "#393B44",
    fg: "#dddddd",
  },
  opacity: {
    bg: "#00000000",
    fg: "#547AD5",
  },
  dark: {
    bg: "#080F14",
    fg: "#ffffff",
  },
  light: {
    bg: "#eeeeee",
    fg: "#000000",
  },
  emphasize: {
    bg: "#C8FF00",
    fg: "#000000",
  }
};

/**
 * @param {{type:'normal'|'primary'|'danger'|'emphasize'|'dark'|'light'|'opacity'|null, isLoading:boolean|null, disabled:boolean|null, text:string, onPress:()=>void}} params
 */
const HighlightButton = ({ icon, type, text, isLoading, disabled, onPress }) => {
  let clr = colorTable[type];
  if (type == null) {
    clr = colorTable["normal"];
  }

  const onPressHandler = () => {
    if (onPress != null && isLoading != true) {
      onPress();
    }
  };

  const _clr = disabled ? colorTable.disabled : clr;
  const bgClassName = `px-[10px] py-[5px] items-center rounded flex flex-row  ${isLoading ? "opacity-50" : ""
    }`;
  const fgClassName = "text-center";

  return (
    <TouchableHighlight
      disabled={isLoading}
      onPress={disabled ? null : onPressHandler}
      className="mx-[5px] rounded"
    >
      <View className={bgClassName} style={{ backgroundColor: _clr.bg }}>
        {isLoading ? (
          <ActivityIndicator size="small" color="white" className="mr-2" />
        ) : (
          <></>
        )}
        {
          icon == null ? <></> : <Image source={icon} className="w-[18px] h-[18px] mr-2" />
        }

        <Text className={fgClassName} style={{ color: _clr.fg }}>{text}</Text>
      </View>
    </TouchableHighlight>
  );
};

export default HighlightButton;
