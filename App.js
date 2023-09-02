// import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { LesConstants } from "les-im-components";
import { useEffect, useState, useRef } from "react";
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
import NotificationScreen from "./src/Screens/NotificationScreen";
import FriendRequestScreen from "./src/Screens/FriendRequestScreen";
import FriendSearchScreen from "./src/Screens/FriendsSearchScreen";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import JSEvent from "./src/utils/JSEvent";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Button,
} from "react-native";
import { UIEvents, DataEvents } from "./src/modules/Events";
import Constants from "./src/modules/Constants";
import DatabaseService from "./src/services/DatabaseService";
import DataCenter from "./src/modules/DataCenter";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import FriendAddScreen from "./src/Screens/FriendAddScreen";
import GroupInfoScreen from "./src/Screens/GroupInfoScreen";
import GroupCreateScreen from "./src/Screens/GroupCreateScreen";
import GroupInviteScreen from "./src/Screens/GroupInviteScreen";
import auth, { firebase } from "@react-native-firebase/auth";
import { VerifyEmailScreen } from "./src/Screens/VerifyEmailScreen";
import { useNavigation } from "@react-navigation/native";
import ChatScreenV2 from "./src/Screens/ChatScreenV2";
import WalletScreen from "./src/Screens/WalletScreen";
import HighlightButton from "./src/Components/HighlightButton";

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
};

const BottomTabNavigation = () => {
  const [newMsgCountStr, setNewMsgCount] = useState(null);

  const updateMsgCountStr = () => {
    const count = DataCenter.messageCache.getNewMessageCount();
    let countStr = null;
    if (count > 0) {
      countStr = count > 99 ? "99+" : count;
    }
    setNewMsgCount(countStr);
  };

  const onNewMessageCountChanged = () => {
    updateMsgCountStr();
  };

  useEffect(() => {
    JSEvent.on(DataEvents.User.UserState_DataReady, onNewMessageCountChanged);
    JSEvent.on(
      UIEvents.Message.Message_New_Count_Changed,
      onNewMessageCountChanged
    );
    return () => {
      JSEvent.remove(
        DataEvents.User.UserState_DataReady,
        onNewMessageCountChanged
      );
      JSEvent.remove(
        UIEvents.Message.Message_New_Count_Changed,
        onNewMessageCountChanged
      );
    };
  }, []);

  return (
    <BottomTab.Navigator
      // screenListeners={{
      //   focus: e => {
      //     console.log("----", e);
      //   }
      // }}
      sceneContainerStyle={{ backgroundColor: "#080F14" }}
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#131F2A",
          height: bottomTabHeight,
        },
        tabBarShowLabel: false,
        headerStyle: {
          backgroundColor: "#080F14",
        },
        headerTitleStyle: {
          marginLeft: 5,
          color: "#ffffff",
          fontSize: 30,
          fontWeight: "bold",
        },
        headerTitleAlign: "left",
        headerShadowVisible: false,
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
      initialRouteName="Home"
    >
      <BottomTab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
          title: "NexGami",
          headerShown: true,
        }}
      />
      {/* <BottomTab.Screen
        name="ChatsOld"
        component={ChatScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" color={color} size={size} />
          ),
        }}
      /> */}
      <BottomTab.Screen
        name="Chats"
        component={ChatScreenV2}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" color={color} size={size} />
          ),
          tabBarBadge: newMsgCountStr,
        }}
      />
      <BottomTab.Screen
        name="Friends"
        component={FriendsScreen}
        options={({ navigation }) => ({
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" color={color} size={size} />
          ),
          headerShown: true,
          headerRight: () => (
            <View className="flex-row items-center mr-[5vw]">
              <TouchableOpacity
                onPress={() => navigation.navigate("FriendSearch")}
                className="mr-[2vw]"
              >
                <MaterialIcons name="search" size={30} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate("FriendAdd")}
              >
                <MaterialIcons
                  name="person-add-alt-1"
                  size={28}
                  color="white"
                />
              </TouchableOpacity>
            </View>
          ),
        })}
      />
      {/* <BottomTab.Screen
        name="Games"
        component={GamesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="game-controller-outline"
              color={color}
              size={size}
            />
          ),
          headerShown: true,
        }}
      /> */}
      <BottomTab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="wallet"
              color={color}
              size={size}
            />
          ),
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
};

export default function App() {
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const navigationRef = useRef(null);

  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  function setLoading(state) {
    console.log("is loading? ", state);
    setIsLoading(state);
  }

  function setLogin() {
    setIsLoggedin(true);
  }

  /**
   * 重新快速登录失败时调用，导向登陆界面
   * @param {ReloginState} state
   */
  function reloginFailedHandler(state) {
    if (state === Constants.ReloginState.ReloginFailed) {
      navigationRef.current?.navigate("Login");
    }
  }

  useEffect(() => {
    JSEvent.on(UIEvents.AppState_UIUpdated, setLoading);
    JSEvent.on(DataEvents.User.UserState_Relogin, reloginFailedHandler);

    return () => {
      JSEvent.remove(UIEvents.AppState_UIUpdated, setLoading);
      JSEvent.remove(DataEvents.User.UserState_Relogin, reloginFailedHandler);
    };
  }, []);

  /*
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
    return () => {
      onAppDestroyed();
    };
  }, []);
  */

  /*
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

  const AuthScreens = () => (
    <>
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="CreateName" component={CreateNameScreen} />
    </>
  );
  */

  return (
    <GestureHandlerRootView className="flex-1">
      <BottomSheetModalProvider>
        <StatusBar style="light" />

        {/* {isInitializing ? (
        <InitialScreen />
      ) : (
      <NavigationContainer>
        {isLoggedin ? (
          <Stack.Navigator initialRouteName="BottomTab">
            {ContentScreens()}
            {AuthScreens()}
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
            {ContentScreens()}
          </Stack.Navigator>
        )}
   
      </NavigationContainer>
      )}
      */}
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator
            initialRouteName="initial"
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
            <Stack.Screen
              name="initial"
              component={InitialScreen}
              options={{ headerShown: false }}
            />
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
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                headerBackVisible: false,
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="VerifyEmail"
              component={VerifyEmailScreen}
              options={{
                headerTitle: "Verify Email",
                headerLeft: () => {
                  const navigation = useNavigation();
                  return (
                    // <Button
                    //   title="Sign in"
                    //   onPress={() => {
                    //     navigation.navigate("Login");
                    //     firebase.auth().signOut();
                    //   }}
                    // />
                    <HighlightButton type="opacity" text="Go to Sign in" onPress={() => {
                      navigation.navigate("Login");
                      firebase.auth().signOut();
                    }} />
                  );
                },
              }}
            />
            <Stack.Screen name="CreateName" component={CreateNameScreen}
              options={
                { headerBackVisible: false }
              } />
            <Stack.Screen name="Notification" component={NotificationScreen} />
            <Stack.Screen
              name="FriendRequest"
              component={FriendRequestScreen}
              options={{ headerTitle: "Friend Request" }}
            />
            <Stack.Screen name="FriendSearch" component={FriendSearchScreen} />
            <Stack.Screen
              name="GroupCreate"
              component={GroupCreateScreen}
              options={{ headerTitle: "Create Group" }}
            />
            <Stack.Screen
              name="FriendAdd"
              component={FriendAddScreen}
              options={{ headerTitle: "Add Friend" }}
            />
            <Stack.Screen
              name="GroupInfo"
              component={GroupInfoScreen}
              options={{ headerTitle: "Group Information" }}
            />
            <Stack.Screen
              name="GroupInvite"
              component={GroupInviteScreen}
            // options={{ headerTitle: "Group Information" }}
            />
          </Stack.Navigator>
        </NavigationContainer>
        {isLoading && (
          <View className="h-[5vh] items-center justify-center bg-[#1F4168] flex-row">
            <Text className="text-white pr-[10px]">Reconnecting</Text>
            <ActivityIndicator size={"small"} color={"#CACACA"} />
          </View>
        )}
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
