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
import { useState, useEffect } from "react";
import MockServer from "./utils/MockServer";
import JSEvent from "./utils/JSEvent";
import { DataEvents } from "./modules/Events";
import DataCenter from "./modules/DataCenter";
import { loginCheck } from "./utils/auth";
import { retrieveData } from "./utils/auth";

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
  const [isLoggedin, setIsLoggedin] = useState(false);

  function setLogin() {
    setIsLoggedin(true);
  }

  useEffect(() => {
    // 注册监听是否登陆
    JSEvent.on(DataEvents.User.UserState_isLoggedin, setLogin);
    // 初始化所有服务
    Promise.all([retrieveData("accountId"), retrieveData("loginKey")])
      .then((res) => {
        console.log("id & key: ", res);
        const [accountId, loginKey] = [res[0], res[1]];

        if (accountId && loginKey) {
          loginCheck(accountId, loginKey, "")
            .then((res) => {
              console.log("loginCheck: ", res);
            })
            .catch((e) => {
              console.log("check error: ", e);
            });
        }
      })
      .catch((e) => {
        console.log("can't retrieve accountId and loginKey");
      });

    DataCenter.initServices();

    return () => {
      JSEvent.remove(DataEvents.User.UserState_isLoggedin, setLogin);
    };
  }, []);

  useEffect(() => {
    /*
      如果登陆成功，发送各个服务的事件
    */
    if (isLoggedin) {
      // 模拟服务器发送数据
      const mockServer = new MockServer();
      // mock服务器发送好友状态改变事件;
      mockServer.sendMockFriendStateData();
    }
  }, [isLoggedin]);

  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator
          // initialRouteName="BottomTab"
          // initialRouteName="Login"
          initialRouteName={isLoggedin ? "BottomTab" : "Login"}
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
      </NavigationContainer>
    </>
  );
}
