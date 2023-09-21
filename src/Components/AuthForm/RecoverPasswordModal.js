import { Modal, View, Text } from "react-native";
import HighlightButton from "../HighlightButton";
import { firebase } from "@react-native-firebase/auth";
import { useState } from "react";
import { DialogModal } from "../FeedbackModal";

const RecoverPasswordModal = ({
  recoverModalVisible,
  email,
  closeRecoverPasswordModal,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedback, setFeedbak] = useState();

  const resetPasswordHandler = async () => {
    setIsLoading(true);
    try {
      await firebase.auth().sendPasswordResetEmail(email);
      setFeedbackModalOpen(true);
      setFeedbak(
        "Reocovering password email has been sent to your email address. Follow the instructions to recover your password."
      );
    } catch (e) {
      setFeedbak(e);
    }
    setIsLoading(false);
    closeRecoverPasswordModal();
  };

  return (
    <>
      <DialogModal
        visible={feedbackModalOpen}
        onButtonPressed={() => setFeedbackModalOpen(false)}
        content={feedback}
      />
      <Modal
        animationType="fade"
        visible={recoverModalVisible}
        transparent={true}
      >
        <View className="flex-1 justify-center items-center bg-black/[0.6]">
          <View className="bg-[#2A2C37] w-[90vw] max-w-md p-[15px] rounded">
            <Text className="text-white text-[18px] font-bold mb-[20px]">
              Recover Password
            </Text>
            <Text className="text-white text-[15px]">
              Get instructions sent to{" "}
              <Text className="font-bold">{email}</Text> that explain how to
              reset your password.
            </Text>
            <View className="flex-row justify-end">
              <HighlightButton
                type={"primary"}
                text="Send"
                onPress={resetPasswordHandler}
                isLoading={isLoading}
                disabled={isLoading}
              />
              <HighlightButton
                type={"normal"}
                text="Cancel"
                onPress={closeRecoverPasswordModal}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default RecoverPasswordModal;
