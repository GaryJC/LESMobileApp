import { View, Text } from "react-native";
import { AvatarColorPlatte } from "../../assets/AvatarColorPlatte";
import { useState, useRef, useEffect } from "react";
import { defaults } from "lodash";

const AvatarOld = ({ tag, name, isGroup }) => {
  const [fontSize, setFontSize] = useState(0);
  //const avatarRef = useRef(null);

  const colorNumber = tag ? tag % 10 : 0;
  const avatarColor = AvatarColorPlatte[colorNumber] || "#FFFFFF"; // Default color, adjust as necessary

  const initLetter = name ? name[0] : "?"; // Fallback if no name is provided

  const handleLayout = (event) => {
    const width = event.nativeEvent.layout.width;
    setFontSize(0.4 * width); // Adjust 0.4 to another fraction if desired
  };

  return (
    <View
      //ref={avatarRef}
      onLayout={handleLayout}
      className={
        isGroup
          ? "w-[100%] h-[100%] justify-center items-center rounded-xl"
          : "w-[100%] h-[100%] justify-center items-center rounded-full"
      }
      style={{ backgroundColor: avatarColor }}
    >
      <Text className="text-white font-bold" style={{ fontSize: fontSize }}>
        {initLetter}
      </Text>
    </View>
  );
};

const defaultSize = { w: 50, h: 50, font: 20, groupMark: 20, groupMarkFont: 13 };

/**
 * badgeNumber 显示的角标数字 0表示隐藏
 * 
 * @param {{tag:number, name:string,isGroup:boolean,isSelected:boolean, badgeNumber:number|null,size:{w:number,h:number,font:number,groupMark:number,groupMarkFont:number}}} params
 * @returns
 */
const Avatar = ({ tag, name, isGroup, isSelected, badgeNumber, size, children }) => {
  //const [fontSize, setFontSize] = useState(16);
  //const avatarRef = useRef(null);
  if (size == null) {
    size = defaultSize;
  }

  const initLetter = name ? name[0] : "?"; // Fallback if no name is provided

  //const colorNumber = tag ? tag % 10 : 0;
  //const avatarColor = AvatarColorPlatte[colorNumber] || "#FFFFFF"; // Default color, adjust as necessary

  //改为使用名字的第一个字母的ascii码作为color的索引
  const idx = initLetter.charCodeAt(0) % 10;
  const avatarColor = AvatarColorPlatte.bgColor[idx];

  // const handleLayout = (event) => {
  //   const width = event.nativeEvent.layout.width;
  //   setFontSize(0.4 * width); // Adjust 0.4 to another fraction if desired
  // };

  const border = " border-[#5EB857] border-4";

  const roundedSize = Math.min(size.w / 5, 15);

  const roundStyle = isGroup ? { borderRadius: roundedSize } : {};

  let viewClass = isGroup
    ? `w-[${size.w}px] h-[${size.h
    }px] justify-center items-center absolute left-0 top-0`
    : `w-[${size.w}px] h-[${size.h}px] justify-center items-center rounded-full absolute left-0 top-0`;

  let borderClass = isGroup
    ? `w-[${size.w}px] h-[${size.h
    }px] justify-center items-center ${border} absolute left-0 top-0`
    : `w-[${size.w}px] h-[${size.h}px] justify-center items-center rounded-full ${border} absolute left-0 top-0`;

  borderClass += isSelected ? " opacity-80" : " hidden";

  // const fontClass = "text-white font-bold text-[" + size.font + "px]";
  const fontClass =
    idx <= 4
      ? `text-[${AvatarColorPlatte.textColor.dark}] font-bold text-[${size.font}px]`
      : `text-[${AvatarColorPlatte.textColor.light}] font-bold text-[${size.font}px]`;


  const groupMarkSize = size.groupMark ?? defaultSize.groupMark;
  const groupFontSize = size.groupMarkFont ?? defaultSize.groupMarkFont;
  const groupBadge =
    isGroup ? (
      <View className={"bg-[#6E5EDB] absolute right-0 top-0 justify-center items-center"}
        style={{ width: groupMarkSize, height: groupMarkSize, borderTopRightRadius: roundedSize, borderBottomLeftRadius: roundedSize }}
      >
        <Text className="text-white" style={{ fontSize: groupFontSize }}>G</Text>
      </View>
    ) : (
      <></>
    );

  return (
    <View className={`w-[${size.w}px] h-[${size.h}px] `}>
      <View
        //ref={avatarRef}
        //onLayout={handleLayout}
        className={viewClass}
        style={{ backgroundColor: avatarColor, ...roundStyle }}
      >
        <Text className={fontClass} style={{ fontSize: size.font }}>
          {initLetter}
        </Text>
      </View>
      <View className={borderClass} style={roundStyle}></View>
      {children}
      {groupBadge}
    </View>
  );
};
export default Avatar;
