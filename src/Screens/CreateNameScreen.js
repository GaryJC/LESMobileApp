import { View, Text, TextInput, Modal } from "react-native";
import InputLayout from "../Components/InputLayout";
import { useEffect, useState } from "react";
import AuthButton from "../Components/AuthButton";
import IMFunctions from "../utils/IMFunctions";
import { useNavigation } from "@react-navigation/native";
import { LesPlatformCenter } from "les-im-components";
import LoadingIndicator from "../Components/LoadingIndicator";
import AuthFormInput from "../Components/AuthForm/AuthFormInput";
import HighlightButton from "../Components/HighlightButton";
import FeedBackModal, {
  DialogButton,
  DialogModal,
} from "../Components/FeedbackModal";

export default function CreateNameScreen() {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedback, setFeedbak] = useState();
  const [isValidated, setIsValidated] = useState(false);

  const navigation = useNavigation();

  const updateUsername = (val) => {
    setUsername(val);
  };

  const validateInput = (str) => {
    // const regex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    const regex = /^(?![\d_])[a-zA-Z\u4e00-\u9fa5_\d]{2,15}$/;
    // const regex = /^[\w]{3,20}$/;
    return regex.test(str);
  };

  const doublecheckHandler = () => {
    if (!validateInput(username)) {
      setFeedbackModalOpen(true);
      setFeedbak(
        "Name has to be more than 2 characters, less than 15 characters; can not contain any special characters except '_'; initial letter can not be numbers or '_'"
      );
      setIsValidated(false);
      return;
    }
    setFeedbackModalOpen(true);
    setFeedbak("You can not change the nickname once it has been created!");
    setIsValidated(true);
  };

  const setNameHandler = () => {
    setIsLoading(true);
    LesPlatformCenter.IMFunctions.setName(username)
      .then((res) => {
        console.log("name create success: ", res);
        navigation.navigate("MainNavigation");
        setFeedbackModalOpen(false);
      })
      .catch((e) => {
        setFeedbackModalOpen(true);
        setFeedbak(e);
        console.log("set name error: ", e);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <View className="flex-1 justify-center">
      <View className="bg-[#2A2C37] p-[20px]">
        <Text className="text-white text-[18px] font-bold">
          Create your nickname
        </Text>
        <View className="mt-[20px]">
          <AuthFormInput value={username} onChangeHandler={updateUsername} />
        </View>
        <View className="items-center mt-[20px]">
          <HighlightButton
            type={"primary"}
            text={"Submit"}
            isLoading={isLoading}
            disabled={isLoading || !username.length}
            onPress={doublecheckHandler}
          />
        </View>
        {/* <LoadingIndicator isLoading={isLoading} /> */}
      </View>

      <DialogModal
        content={feedback}
        visible={feedbackModalOpen}
        onButtonPressed={(btn) => {
          setFeedbackModalOpen(false);
          if (isValidated) {
            setNameHandler();
          }
        }}
      />

      {/* <FeedBackModal
        feedbackModalOpen={feedbackModalOpen}
        feedback={feedback}
        setFeedbackModalOpen={setFeedbackModalOpen}
      >
        {isValidated && (
          <HighlightButton
            type={"primary"}
            text={"Ok"}
            onPress={setNameHandler}
            isLoading={isLoading}
            disabled={isLoading}
          />
        )}
      </FeedBackModal> */}
    </View>
  );
}
