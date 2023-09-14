import { View, Text, TouchableHighlight } from "react-native";
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
    fg: "#123456",
  },
  opacity: {
    bg: "#00000000",
    fg: "#547AD5",
  },
};

/**
 * @param {{type:'normal'|'primary'|'danger'|'opacity'|null, isLoading:boolean|null, disabled:boolean|null, text:string, onPress:()=>void}} params
 */
const HighlightButton = ({ type, text, isLoading, disabled, onPress }) => {
  let clr = colorTable[type];
  if (type == null) {
    clr = colorTable["normal"];
  }

  const onPressHandler = () => {
    if (onPress != null) {
      onPress();
    }
  };

  const _clr = disabled ? colorTable.disabled : clr;
  const bgClassName = `bg-[${
    _clr.bg
  }] px-[10px] py-[5px] rounded flex flex-row  ${
    isLoading ? "opacity-50" : ""
  }`;
  const fgClassName = `text-[${_clr.fg}] text-center`;

  return (
    <TouchableHighlight
      onPress={disabled ? null : onPressHandler}
      className="mx-[5px] rounded"
    >
      <View className={bgClassName} style={{ backgroundColor: _clr.bg }}>
        {isLoading ? (
          <ActivityIndicator size="small" color="white" className="mr-2" />
        ) : (
          <></>
        )}
        <Text className={fgClassName} style={{ color: _clr.fg }}>
          {text}
        </Text>
      </View>
    </TouchableHighlight>
  );
};

export default HighlightButton;
