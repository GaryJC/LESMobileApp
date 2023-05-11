// import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, KeyboardAvoidingView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import Home from "./Screens/Home";
import Friends from "./Screens/Friends";
import Chats from "./Screens/Chats";
import User from "./Screens/User";
import Games from "./Screens/Games";
import GameDetails from "./Screens/GameDetails";

const BottomTab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const BottomTabNavigation = () => (
  <BottomTab.Navigator
    sceneContainerStyle={{ backgroundColor: "#080F14" }}
    screenOptions={{
      tabBarStyle: {
        backgroundColor: "#131F2A",
      },
      tabBarShowLabel: false,
      // headerTransparent: true,
      headerStyle: {
        backgroundColor: "#080F14",
      },
      headerShadowVisible: false,
      headerShown: false,
      tabBarHideOnKeyboard: true,
    }}
  >
    <BottomTab.Screen
      name="Home"
      component={Home}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="home-outline" color={color} size={size} />
        ),
        // headerTitleStyle: {
        //   color: "#ffffff",
        //   fontSize: 30,
        //   marginLeft: 20,
        // },
        // title: "Light Esports",
        // headerShown: true,
      }}
    />
    <BottomTab.Screen
      name="Chats"
      component={Chats}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="chatbubbles-outline" color={color} size={size} />
        ),
      }}
    />
    <BottomTab.Screen
      name="Friends"
      component={Friends}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="people-outline" color={color} size={size} />
        ),
      }}
    />
    <BottomTab.Screen
      name="Games"
      component={Games}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="game-controller-outline" color={color} size={size} />
        ),
        headerTitleStyle: {
          color: "white",
          fontWeight: "bold",
          fontSize: 40,
        },
        headerShown: true,
      }}
    />
    <BottomTab.Screen
      name="User"
      component={User}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="person-outline" color={color} size={size} />
        ),
      }}
    />
  </BottomTab.Navigator>
);

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="BottomTab"
          screenOptions={{
            headerStyle: {
              backgroundColor: "#080F14",
            },
            contentStyle: { backgroundColor: "#080F14" },
          }}
        >
          <Stack.Screen
            name="BottomTab"
            component={BottomTabNavigation}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="GameDetails"
            component={GameDetails}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
        {/* <BottomTabNavigation /> */}
      </NavigationContainer>
    </>
  );
}
