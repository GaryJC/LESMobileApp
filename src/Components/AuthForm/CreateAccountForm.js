import { View, Modal, Text, TextInput, TouchableHighlight } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { firebase } from "@react-native-firebase/auth";
import LoginService from "../../services/LoginService";
import LoadingIndicator from "../LoadingIndicator";
import PasswordInput from "../PasswordInput";
import HighlightButton from "../HighlightButton";

const CreateAccountForm = ({ email, setEmail, closeModalHandler }) => {
  const [password, setPassword] = useState();
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();

  const createAccountHandler = async () => {
    setIsLoading(true);
    try {
      const user = await firebase
        .auth()
        .createUserWithEmailAndPassword(email, password);
      console.log("user: ", user);
      // await firebase.auth().signInWithEmailAndPassword(email, password);
      const { loginState, id, imServerState } =
        await LoginService.Inst.firebaseQuickLogin();
      console.log("login state", loginState, id);
      // setLoginState(loginState);
      navigation.navigate("VerifyEmail", { loginState, id, imServerState });
      closeModalHandler();
    } catch (e) {
      console.log("error: ", e, e.code);
      switch (e.code) {
        case "auth/email-already-in-use":
          setError(
            "There already exists an account with the given email address"
          );
          break;
        case "auth/invalid-email":
          setError("The email address is not valid");
          break;
        case "auth/weak-password":
          setError(
            "Password must contain at least one uppercase, lowercase, and number, and less than 16 characters, longer than 8 characters."
          );
          break;
        case "auth/operation-not-allowed":
          setError("Account is not enabled");
          break;
      }
    }
    setIsLoading(false);
  };

  /*
  function validateEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }

  function validatePassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
  }

  function updateInputValueHandler(inputType, inputValue) {
    // console.log(inputType, inputValue);
    switch (inputType) {
      case "email":
        setEmail(inputValue);
        if (validateEmail(inputValue)) {
          setEmailError(null);
        } else {
          setEmailError("Invalid Email! Please enter a valid email.");
        }
        break;
      case "password":
        setPassword(inputValue);
        if (validatePassword(inputValue)) {
          setPasswordError(null);
        } else {
          setPasswordError(
            "Invalid Password! Password must contain at least one uppercase, one lowercase letter, one number, and be longer than 8 characters less than 18 characters."
          );
        }
        break;
    }
  }
  */

  return (
    <View>
      <Text className="text-white text-[18px] font-bold mb-[20px]">
        Create Account
      </Text>
      <Text className="text-[16px] font-bold text-white mb-[5px]">Email</Text>
      <TextInput
        editable={false}
        placeholder="Please input your email address"
        placeholderTextColor={"#C3C3C3"}
        value={email}
        // onChangeText={(value) => updateInputValueHandler("email", value)}
        onChangeText={setEmail}
        className="border-b-2 border-[#394879] text-white mb-[10px]"
      />
      {/* {emailError && (
        <Text className="text-[#FF0000]">
          Please input a valid email address
        </Text>
      )} */}
      <Text className="text-[16px] font-bold text-white mb-[5px]">
        Password
      </Text>
      <PasswordInput initValue={password} onChangeText={e => {
        setPassword(e);
      }} />
      {/* {passwordError && (
        <View>
          <Text className="text-[#FF0000]">
            Password must contain at least one uppercase, lowercase, and number
          </Text>
          <Text className="text-[#FF0000]">
            The length of password must less than 18 characters
          </Text>
          <Text className="text-[#FF0000]">
            The length of password must longer than 8 characters
          </Text>
        </View>
      )} */}
      {error && <Text className="text-[#FF0000]">{error}</Text>}
      <View className="flex-row justify-end mt-[20px]">
        <HighlightButton
          type={"normal"}
          text={"Cancel"}
          onPress={closeModalHandler}
        />
        <HighlightButton
          type={"primary"}
          text={"Create"}
          onPress={createAccountHandler}
          isLoading={isLoading}
        />

        {/* <TouchableHighlight onPress={closeModalHandler} className= "mr-[10px] rounded">
          <View className="bg-[#393B44] px-[10px] py-[5px] rounded">
            <Text className="text-[#547AD5] text-center">Cancel</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight onPress={createAccountHandler} className="rounded">
          <View className="bg-[#ff3300] px-[10px] py-[5px] rounded">
            <Text className="text-white text-center">Create</Text>
          </View>
        </TouchableHighlight> */}
      </View>
      <LoadingIndicator isLoading={isLoading} />
    </View>
  );
};

export default CreateAccountForm;
