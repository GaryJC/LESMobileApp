// import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { LesConstants } from "les-im-components";
import { useEffect, useState } from "react";
import { Dimensions } from "react-native";
import ChatScreen from "./src/Screens/ChatScreen";
import CreateNameScreen from "./src/Screens/CreateNameScreen";
import FriendsScreen from "./src/Screens/FriendsScreen";
import GameDetailsScreen from "./src/Screens/GameDetailsScreen";
import GamesScreen from "./src/Screens/GamesScreen";
import HomeScreen from "./src/Screens/HomeScreen";
import SignupScreen from "./src/Screens/SignupScreen";
import UserScreen from "./src/Screens/UserScreen";
import LoginScreen from "./src/Screens/LoginScreen";
import InitialScreen from "./src/Screens/InitialScreen";
import ServiceCenter from "./src/services/ServiceCenter";
import LoginService from "./src/services/LoginService";
import JSEvent from "./src/utils/JSEvent";

const BottomTab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const deviceHeight = Dimensions.get("screen").height;
const bottomTabHeight = deviceHeight * 0.08;

const onAppInit = async () => {
  await ServiceCenter.Inst.loadAllServices();
};
const onAppDestroyed = async () => {
  //保存页面会刷新app，此处重置event，否则会出现重复监听问题
  JSEvent.reset();
  ServiceCenter.Inst.onAppDestroyed();
}

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
  const [isInitializing, setIsInitializing] = useState(false);

  function setLogin() {
    setIsLoggedin(true);
  }

  useEffect(() => {
    async function asyncInit() {
      //等待所有服务装载完毕
      setIsInitializing(true);
      await onAppInit();

      const loginService = LoginService.Inst;
      const quickLogin = loginService.canQuickLogin();
      // const quickLogin = false
      // console.log("quickLogin: ", quickLogin);

      //缓存中有登录信息，可以快速登录
      if (quickLogin) {
        const result = await loginService.quickLogin();
        console.log("result:", result);
        if (result == LesConstants.ErrorCodes.Success) {
          //TODO 登陆成功了，跳转到主界面
          setLogin();
        } else {
          //TODO 快速登陆失败了，跳转到LoginScreen
        }
      } else {
        //TODO 没有登录信息，跳转到LoginScreen
      }

      setIsInitializing(false);
    }

    asyncInit();
    return () => { onAppDestroyed() };
  }, []);

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
      {isInitializing ? (
        <InitialScreen />
      ) : (
        <NavigationContainer>
          {isLoggedin ? (
            <Stack.Navigator initialRouteName="BottomTab">
              {ContentScreens()}
            </Stack.Navigator>
          ) : (
            <Stack.Navigator
              initialRouteName="Login"
              screenOptions={{
                headerStyle: {
                  backgroundColor: "#080F14",
                },
                headerTitleStyle: {
                  color: "white",
                },

                contentStyle: { backgroundColor: "#080F14" },
              }}
            >
              <Stack.Screen name="Signup" component={SignupScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="CreateName" component={CreateNameScreen} />
              {ContentScreens()}
            </Stack.Navigator>
          )}
        </NavigationContainer>
      )}
    </>
  );
}
