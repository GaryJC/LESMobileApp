import { View, TouchableHighlight } from "react-native";
import NotificationService from "../services/NotificationService";
import { MaterialIcons } from "@expo/vector-icons";
import FeedBackModal, { DialogModal } from "./FeedbackModal";
import { useState } from "react";
import { LesConstants } from "les-im-components";

const FriendAddButton = ({ userData, setIsLoading }) => {
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedback, setFeedbak] = useState();

  const addFriendHandler = async () => {
    setIsLoading(true);
    console.log(userData);
    try {
      await NotificationService.Inst.sendFriendInvitation(userData.id);
      console.log("send friend invite success: ", userData);
      setFeedbak("You have sent the frend request sucessfully!");
    } catch (e) {
      switch (e) {
        case LesConstants.ErrorCodes.UsersAreFriend:
          setFeedbak(`${userData.name} is already your friend.`);
          break;
        case LesConstants.ErrorCodes.InvitationAlreadySent:
          setFeedbak("You have already sent the request.");
          break;
        default:
          setFeedbak("Error: ", e);
          break;
      }
    }
    setFeedbackModalOpen(true);
    setIsLoading(false);
  };

  return (
    <>
      <TouchableHighlight onPress={addFriendHandler} className="justify-center">
        <View className="">
          <MaterialIcons name="person-add-alt-1" size={24} color="white" />
        </View>
      </TouchableHighlight>
      {/* <FeedBackModal
        feedbackModalOpen={feedbackModalOpen}
        setFeedbackModalOpen={setFeedbackModalOpen}
        feedback={feedback}
      /> */}

      <DialogModal
        visible={feedbackModalOpen}
        onButtonPressed={(btn) => {
          setFeedbackModalOpen(false);
        }}
        content={feedback}
      />
    </>
  );
};

export default FriendAddButton;
