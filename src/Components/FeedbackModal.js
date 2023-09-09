import { Modal, Text, View } from "react-native";
import { TouchableHighlight } from "react-native-gesture-handler";
import HighlightButton from "./HighlightButton";

const FeedBackModal = ({
  feedbackModalOpen,
  setFeedbackModalOpen,
  feedback,
  children,
}) => {
  return (
    <Modal visible={feedbackModalOpen} transparent={true} className="flex">
      <View className="justify-center items-center bg-black/[0.6] flex-1">
        <View className="bg-[#262F38] rounded justify-center items-center p-[20px]">
          <Text className="text-white text-[16px] mb-[10px]">{feedback}</Text>
          <View className="flex-row">
            {children}
            <HighlightButton
              type={"normal"}
              text={"Cancel"}
              onPress={() => setFeedbackModalOpen(false)}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FeedBackModal;
