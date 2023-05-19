// import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, KeyboardAvoidingView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "./Screens/HomeScreen";
import FriendsScreen from "./Screens/FriendsScreen";
import ChatScreen from "./Screens/ChatScreen";
import UserScreen from "./Screens/UserScreen";
import GamesScreen from "./Screens/GamesScreen";
import GameDetailsScreen from "./Screens/GameDetailsScreen";
import { Dimensions } from "react-native";
import SignupScreen from "./Screens/SignupScreen";
import LoginScreen from "./Screens/LoginScreen";

const BottomTab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const deviceHeight = Dimensions.get("screen").height;
const bottomTabHeight = deviceHeight * 0.08;

const BottomTabNavigation = () => (
  <BottomTab.Navigator
    sceneContainerStyle={{ backgroundColor: "#080F14" }}
    screenOptions={{
      tabBarStyle: {
        backgroundColor: "#131F2A",
        height: bottomTabHeight,
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
      component={HomeScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="home-outline" color={color} size={size} />
        ),
        headerTitleStyle: {
          color: "#ffffff",
          fontSize: 30,
          fontWeight: "bold",
          // marginLeft: 20,
        },
        title: "Light Esports",
        headerShown: true,
      }}
    />
    <BottomTab.Screen
      name="Chats"
      component={ChatScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="chatbubbles-outline" color={color} size={size} />
        ),
      }}
    />
    <BottomTab.Screen
      name="Friends"
      component={FriendsScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="people-outline" color={color} size={size} />
        ),
        headerTitleStyle: {
          color: "white",
          fontWeight: "bold",
          fontSize: 30,
        },
        headerShown: true,
      }}
    />
    <BottomTab.Screen
      name="Games"
      component={GamesScreen}
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
      component={UserScreen}
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
          // initialRouteName="BottomTab"
          initialRouteName="Signup"
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
            component={GameDetailsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Signup"
            component={SignupScreen}
            options={{
              headerShown: true,
              headerTitleStyle: {
                color: "white",
              },
            }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              headerShown: true,
              headerTitleStyle: {
                color: "white",
              },
            }}
          />
        </Stack.Navigator>
        {/* <BottomTabNavigation /> */}
      </NavigationContainer>
    </>
  );
}
