import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  Pressable,
} from "react-native";
import { getFilterOption, getFilteredGames } from "./handler";
import {
  renderChainIcon,
  renderChainName,
  renderGameGenreName,
  renderGameStatusIcon,
  renderGameStatusName,
  renderPlatformIcon,
  renderPlatformName,
} from "../../utils/render";
import GameCard from "./GameCard";
// import Checkbox from '@react-native-community/checkbox';
import Icon from "react-native-vector-icons/MaterialIcons";

export default function GameFilter() {
  //   const searchParams = useSearchParams();
  //   const genre = searchParams.get("genre");

  const [filters, setFilters] = useState({});
  const [checkedOptions, setCheckedOptions] = useState({
    genre: [],
    chain: [],
    platform: [],
    status: [],
  });
  const [isOpen, setIsOpen] = useState(false);
  const [filteredGames, setFilteredGames] = useState([]);

  const closeDrawer = () => {
    setIsOpen(false);
  };

  const openDrawer = () => {
    setIsOpen(true);
  };

  const onFilterChange = (category, value, checked) => {
    if (checked) {
      setCheckedOptions((prev) => ({
        ...prev,
        [category]: Array.isArray(checkedOptions[category])
          ? [...checkedOptions[category], value]
          : [value],
      }));
    } else {
      setCheckedOptions((prev) => ({
        ...prev,
        [category]: checkedOptions[category].filter((item) => item != value),
      }));
    }
  };

  useEffect(() => {
    const getFilters = async () => {
      const filter = await getFilterOption();
      setFilters(filter);
    };
    getFilters();
  }, []);

  useEffect(() => {
    const getGames = async () => {
      const games = await getFilteredGames(checkedOptions);
      setFilteredGames(games);
    };
    getGames();
  }, [checkedOptions]);

  const renderFilterNames = (category, value) => {
    let children;
    switch (category) {
      case "chain":
        children = (
          <View className="flex-row items-center space-x-1">
            <Image
              source={renderChainIcon(value)}
              style={{ width: 20, height: 20 }}
            />
            <Text className="text-white">{renderChainName(value)}</Text>
          </View>
        );
        break;
      case "genre":
        children = (
          <Text className="text-white">{renderGameGenreName(value)}</Text>
        );
        break;
      case "platform":
        children = (
          <View className="flex-row items-center space-x-1">
            {renderPlatformIcon(value)}
            <Text className="text-white">{renderPlatformName(value)}</Text>
          </View>
        );
        break;
      case "status":
        children = (
          <View className="flex-row items-center space-x-1">
            <Image
              source={renderGameStatusIcon(value)}
              style={tailwind("w-6 h-6")}
            />
            <Text className="text-white">{renderGameStatusName(value)}</Text>
          </View>
        );
        break;
      default:
        children = null;
    }
    return children;
  };

  const renderFilterSection = (filterCategory) => {
    return (
      <View className="mb-4">
        <Text className="text-lg font-bold text-white mb-2">
          {filterCategory.toUpperCase()}
        </Text>
        {filters[filterCategory].map((item, index) => (
          <View
            key={index}
            className="flex-row justify-between items-center mb-2"
          >
            <View className="flex-row items-center">
              <Checkbox
                value={checkedOptions[filterCategory]?.includes(
                  item[filterCategory]
                )}
                onValueChange={(newValue) =>
                  onFilterChange(filterCategory, item[filterCategory], newValue)
                }
              />
              {renderFilterNames(filterCategory, item[filterCategory])}
            </View>
            <Text className="text-white">{item.count}</Text>
          </View>
        ))}
      </View>
    );
  };

  const DrawerFilter = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isOpen}
      onRequestClose={closeDrawer}
    >
      <View className="flex-1 bg-[#202126] p-5">
        <Pressable onPress={closeDrawer} className="absolute top-5 right-5">
          <Icon name="close" size={24} color="white" />
        </Pressable>
        <ScrollView>
          {Object.keys(filters).map((filterCategory, index) => (
            <View key={index}>{renderFilterSection(filterCategory)}</View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <View className="flex-1 bg-black">
      <View className="flex-row justify-between p-4">
        <TouchableOpacity
          onPress={openDrawer}
          className="border-4 border-white py-1 px-4 rounded-3xl"
        >
          <Text className="text-white text-lg">Filter</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredGames}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        renderItem={({ item }) => (
          <View className="w-1/2 p-2">
            <GameCard item={item} />
          </View>
        )}
        contentContainerStyle={tailwind("p-4")}
      />
      <DrawerFilter />
    </View>
  );
}
