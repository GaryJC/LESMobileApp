import { TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const FriendSelectButton = ({ friend, isSelected, setSelectedFriends }) => {
  const toggleFriendSelection = () => {
    if (isSelected) {
      setSelectedFriends((prev) =>
        prev.filter((selected) => selected.id !== friend.id)
      );
    } else {
      setSelectedFriends((prev) => [...prev, friend]);
    }
  };

  return (
    <TouchableOpacity
      className="justify-center"
      onPress={toggleFriendSelection}
    >
      {isSelected ? (
        <MaterialIcons name="check-box" size={24} color="white" />
      ) : (
        <MaterialIcons name="check-box-outline-blank" size={24} color="white" />
      )}
    </TouchableOpacity>
  );
};

export default FriendSelectButton;
