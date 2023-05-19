import { View, TextInput, TouchableHighlight, Text } from "react-native";

export default function LoginScreen() {
  return (
    <View>
      <View>
        <TextInput />
      </View>
      <View>
        <TextInput />
      </View>
      <View>
        <TextInput />
      </View>
      <TouchableHighlight>
        <View>
          <Text>Get verification code</Text>
        </View>
      </TouchableHighlight>
    </View>
  );
}
