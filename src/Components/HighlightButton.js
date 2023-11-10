import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Text, TouchableHighlight, View } from "react-native";

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
  },
};

const CD_INTERVAL = 50;
/**
 * 如果cooldown值>0，则点击一次按钮，触发一次cooldown
 * @param {{type:'normal'|'primary'|'danger'|'emphasize'|'dark'|'light'|'opacity'|null, isLoading:boolean|null, disabled:boolean|null, text:string,cooldown:number, onPress:()=>void}} params
 */
const HighlightButton = ({
  icon,
  type,
  text,
  isLoading,
  disabled,
  cooldown,
  onPress,
}) => {
  const [cdTotal, setCdTotal] = useState(0);
  const [cdCurr, setCdCurr] = useState(0);

  const loadAnmi = useRef(new Animated.Value(0)).current;
  loadAnmi.addListener(v => {
    const curr = v.value.toFixed(4);
    setCdCurr(curr)
  })

  const isDisabled = useCallback(() => {
    return disabled || (cdTotal > 0 && cdCurr < cdTotal)
  }, [disabled, isLoading, cdCurr, cdTotal])

  // useEffect(() => {
  //   setCdTotal(cooldown);
  //   if (cooldown > 0) {
  //     Animated.timing(loadAnmi, {
  //       toValue: cooldown,
  //       duration: cooldown * 1000,
  //       useNativeDriver: false,
  //       easing: v => v,
  //     }).start();
  //   }
  // }, [cooldown])

  useEffect(() => {
    if (cdTotal > 0 && cdCurr >= cdTotal) {
      setCdTotal(0);
    }
  }, [cdTotal, cdCurr])

  let clr = colorTable[type];
  if (type == null) {
    clr = colorTable["normal"];
  }

  const onPressHandler = () => {
    if (cooldown > 0) {
      setCdTotal(cooldown);
      setCdCurr(0);
      loadAnmi.setValue(0);
      Animated.timing(loadAnmi, {
        toValue: cooldown,
        duration: cooldown * 1000,
        useNativeDriver: false,
        easing: v => v,
      }).start();
    }
    if (onPress != null && isLoading != true) {
      onPress();
    }
  };

  const _clr = isDisabled() ? colorTable.disabled : clr;
  const bgClassName = `px-[10px] py-[5px] items-center rounded flex flex-col  ${isLoading ? "opacity-50" : ""
    }`;
  const fgClassName = "text-center";

  let cooldownDom = null;

  if (cdTotal > 0 && cdCurr < cdTotal) {
    const width = (cdCurr / cdTotal * 100) + "%";
    cooldownDom = <View className="h-[3px] w-full mt-[1px]" style={{ backgroundColor: _clr.fg }}>
      <View className="h-[3px]" style={{ width: width, backgroundColor: _clr.bg }}></View>
    </View>
  }

  return (
    <TouchableHighlight
      disabled={isLoading || isDisabled()}
      onPress={isDisabled() ? null : onPressHandler}
      className="mx-[5px] rounded"
    >
      <View className={bgClassName} style={{ backgroundColor: _clr.bg }}>
        <View className="flex flex-row items-center">
          {isLoading ? (
            <ActivityIndicator size="small" color="white" className="mr-2" />
          ) : (
            <></>
          )}
          {icon == null ? (
            <></>
          ) : (
            <View className="mr-2 flex justify-center items-center">
              {icon}
            </View>
          )}

          {
            typeof (text) == 'string' ?
              <Text className={fgClassName} style={{ color: _clr.fg }}>
                {text}
              </Text>
              : text
          }
        </View>
        {cooldownDom}
      </View>
    </TouchableHighlight>
  );
};

export default HighlightButton;
