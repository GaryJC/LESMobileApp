import { View, TextInput } from "react-native"
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

export default PasswordInput = ({ initValue, onChangeText }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState(initValue);

    const onChangeTextHandler = (e) => {
        setPassword(e);
        if (onChangeText != null) {
            onChangeText(e);
        }
    }


    return <View className="flex flex-row">
        <TextInput
            placeholder="Please input your password"
            placeholderTextColor={"#C3C3C3"}
            value={password}
            // onChangeText={(value) => updateInputValueHandler("password", value)}
            onChangeText={onChangeTextHandler}
            className="border-b-2 border-[#394879] text-white flex-1"
            secureTextEntry={!showPassword}
        />
        <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={24} color="white"
            onPress={() => {
                setShowPassword(!showPassword);
            }}
        />
    </View>
}