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
import CreateNameScreen from "./Screens/CreateNameScreen";
import { useState, useEffect } from "react";
import MockServer from "./utils/MockServer";
import JSEvent from "./utils/JSEvent";
import { DataEvents } from "./modules/Events";
import DataCenter from "./modules/DataCenter";
import { loginCheck } from "./utils/auth";
import { retrieveData } from "./utils/auth";
import { db, createTable } from "./modules/dataBase";
import IMFunctions from "./utils/IMFunctions";
import { LesPlatformCenter, LesConstants } from "les-im-components";

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
    // 如果没有数据库存在，创建一个数据库
    createTable();

    // 注册监听是否登陆
    JSEvent.on(DataEvents.User.UserState_IsLoggedin, setLogin);
    // 识别设备平台
    // DataCenter.deviceName = Platform.OS.toLocaleUpperCase();
    console.log("Device Name: ", DataCenter.deviceName);

    // 检测是缓存是否存在loginKey, 如果存在则自动登录
    Promise.all([retrieveData("accountId"), retrieveData("loginKey")])
      .then((res) => {
        console.log("id & key: ", res);
        const [accountId, loginKey] = [res[0], res[1]];

        if (accountId && loginKey) {
          loginCheck(parseInt(accountId), loginKey, DataCenter.deviceName)
            .then((res) => {
              const data = res.data;
              console.log("login check response: ", data);
              if (data.code === 0) {
                console.log("correct");
                IMFunctions.connectIMServer(
                  accountId,
                  loginKey,
                  DataCenter.deviceName
                )
                  .then((res) => {
                    console.log("IM connect success response: ", res);
                    /* 登陆事件的发送在setLogin里 */
                    // DataCenter.setLogin(accountId, loginKey, "", "");
                  })
                  .catch((e) => {
                    console.log("IM connect error: ", e);
                  });
              }
            })
            .catch((e) => {
              console.log("Login check error: ", e);
            });
        }
      })
      .catch((e) => {
        console.log("can't retrieve accountId and loginKey");
      });

    // 初始化所有服务
    DataCenter.initServices();

    return () => {
      JSEvent.remove(DataEvents.User.UserState_isLoggedin, setLogin);
    };
  }, []);

  useEffect(() => {
    /*
      如果登陆成功，发送各个服务的事件
    */
    console.log("loggedin? ", isLoggedin);
    if (isLoggedin) {
      // 模拟服务器发送数据
      const mockServer = new MockServer();
      // mock服务器发送好友状态改变事件;
      mockServer.sendMockFriendStateData();
    }
  }, [isLoggedin]);

  const ContentScreens = () => (
    <>
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
    </>
  );

  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        {isLoggedin ? (
          <Stack.Navigator
            initialRouteName="BottomTab"
            screenOptions={{
              headerStyle: {
                backgroundColor: "#080F14",
              },
              contentStyle: { backgroundColor: "#080F14" },
            }}
          >
            {ContentScreens()}
          </Stack.Navigator>
        ) : (
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
              headerStyle: {
                backgroundColor: "#080F14",
              },
              contentStyle: { backgroundColor: "#080F14" },
            }}
          >
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
            <Stack.Screen
              name="CreateName"
              component={CreateNameScreen}
              options={{
                headerShown: true,
                headerTitleStyle: {
                  color: "white",
                },
              }}
            />
            {ContentScreens()}
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </>
  );
}
