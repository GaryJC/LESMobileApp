import { Modal, Text, View } from "react-native";
import { TouchableHighlight } from "react-native-gesture-handler";

const FeedBackModal = ({
  feedbackModalOpen,
  setFeedbackModalOpen,
  feedback,
}) => {
  return (
    <Modal visible={feedbackModalOpen} transparent={true} className="flex">
      <View className="justify-center items-center bg-black/[0.6] flex-1">
        <View className="bg-[#262F38] rounded justify-center items-center p-[20px]">
          <Text className="text-white text-[16px] mb-[10px]">{feedback}</Text>
          <TouchableHighlight onPress={() => setFeedbackModalOpen(false)}>
            <View className="rounded p-[10px] bg-[#4C89F9]">
              <Text className="text-white font-bold">OK</Text>
            </View>
          </TouchableHighlight>
        </View>
      </View>
    </Modal>
  );
};

export default FeedBackModal;
