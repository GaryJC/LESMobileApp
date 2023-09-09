import { View, TextInput } from "react-native";

const AuthFormInput = ({ placeholder, value, onChangeHandler }) => {
  //   console.log(style);
  return (
    <View className="border-b-2 border-[#394879]">
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={"#C3C3C3"}
        value={value}
        onChangeText={onChangeHandler}
        className="text-white"
      />
    </View>
  );
};

export default AuthFormInput;
