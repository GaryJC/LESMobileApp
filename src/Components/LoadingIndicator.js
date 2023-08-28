import React from "react";
import { View, Modal, ActivityIndicator } from "react-native";

const LoadingIndicator = ({ isLoading }) => {
  <View className="flex-1">
    <Modal
      transparent={true}
      animationType={"none"}
      visible={isLoading}
      onRequestClose={() => {
        console.log("Modal closed");
      }}
    >
      <View className="flex-1 justify-center items-center bg-black/[0.6]">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    </Modal>
  </View>;
};

export default LoadingIndicator;
