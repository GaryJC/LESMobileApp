// import { StatusBar } from "expo-status-bar";
import "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { LesConstants } from "les-im-components";
import { useEffect, useState, useRef, useCallback } from "react";
import { Dimensions, Image, Linking, Platform } from "react-native";
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
import QuestScreen from "./src/Screens/QuestScreen";
import QuestUserPointPanel from "./src/Components/Quest/QuestUserPointPanel";
import RedDotIcon from "./src/Components/RedDotIcon";
import { createDrawerNavigator } from "@react-navigation/drawer";
import UserDrawer from "./src/Components/UserDrawer";
import UserHeader from "./src/Components/UserHeader";
import MyProfileScreen from "./src/Screens/MyProfileScreen";
import notifee from "@notifee/react-native";
import NotificationDetailScreen from "./src/Screens/NotificationDetailScreen";
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

const BottomTab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const deviceHeight = Dimensions.get("screen").height;
const bottomTabHeight =
  Platform.OS == "ios" ? deviceHeight * 0.1 : deviceHeight * 0.08;

const onAppInit = async () => {
  await ServiceCenter.Inst.loadAllServices();
};
const onAppDestroyed = async () => {
  //保存页面会刷新app，此处重置event，否则会出现重复监听问题
  JSEvent.reset();
  ServiceCenter.Inst.onAppDestroyed();
};

function CustomDrawerContent(props) {
  return <View>{/* You can put any custom content you want here */}</View>;
}

const DrawerNavigation = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <UserDrawer {...props} />}
      screenOptions={{
        drawerPosition: "left",
        drawerType: "slide",
        headerShown: false,
        drawerStyle: { width: "85%" },
        swipeEdgeWidth: 200,
      }}
    >
      <Drawer.Screen name="BottomTab" component={BottomTabNavigation} />
    </Drawer.Navigator>
  );
};

const BottomTabNavigation = () => {
  const [newMsgCountStr, setNewMsgCount] = useState(null);

  const [newNotiCount, setNewNotiCount] = useState(null);

  const updateMsgCountStr = () => {
    const count = DataCenter.messageCache.getNewMessageCount();
    let countStr = null;
    if (count > 0) {
      countStr = count > 99 ? "99+" : count;
    }
    setNewMsgCount(countStr);
    updateIconBadge();
  };

  const onNewMessageCountChanged = () => {
    updateMsgCountStr();
  };

  const updateNotiCount = () => {
    const count = DataCenter.notifications.unreadCount();
    let unreadCount = null;
    if (count > 0) {
      unreadCount = count > 99 ? "99+" : count;
    }
    setNewNotiCount(unreadCount);
    updateIconBadge();
  };

  const onNewNotiCountChanged = () => {
    updateNotiCount();
  };

  const updateBadgeCount = () => {
    onNewNotiCountChanged();
    onNewMessageCountChanged();
  };

  const updateIconBadge = () => {
    const mc = DataCenter.messageCache.getNewMessageCount();
    const nc = DataCenter.notifications.unreadCount();
    notifee.setBadgeCount(mc + nc);
  }

  useEffect(() => {
    JSEvent.on(DataEvents.User.UserState_IsLoggedin, updateBadgeCount);
    JSEvent.on(
      UIEvents.Message.Message_New_Count_Changed,
      onNewMessageCountChanged
    );
    JSEvent.on(
      DataEvents.Notification.NotificationState_Updated,
      onNewNotiCountChanged
    );
    return () => {
      JSEvent.remove(DataEvents.User.UserState_IsLoggedin, updateBadgeCount);
      JSEvent.remove(
        UIEvents.Message.Message_New_Count_Changed,
        onNewMessageCountChanged
      );
      JSEvent.remove(
        DataEvents.Notification.NotificationState_Updated,
        onNewNotiCountChanged
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
        tabBarHideOnKeyboard: Platform.OS == "ios" ? false : true,
      }}
      initialRouteName="Friends"
    >
      {/* <BottomTab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
          title: "NexGami",
          headerShown: true,
        }}
      /> */}
      {/* <BottomTab.Screen
        name="ChatsOld"
        component={ChatScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" color={color} size={size} />
          ),
        }}
      /> */}
      {/* <BottomTab.Screen name="Drawer" component={DrawerNavigation} /> */}
      <BottomTab.Screen
        name="Friends"
        component={FriendsScreen}
        options={({ navigation }) => ({
          tabBarIcon: ({ color, size }) => (
            <View className="flex justify-center items-center">
              <Ionicons name="people-outline" color={color} size={size} />
              <Text className="text-white text-xs" style={{ color: color }}>
                Social
              </Text>
            </View>
          ),
          headerTitle: () => <UserHeader />,
          headerShown: true,
          tabBarBadge: newNotiCount,
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
              {/* <View className="pl-2">
                <RedDotIcon
                  iconName="notifications"
                  iconSize={25}
                  count={newNotiCount}
                  onPress={() => {
                    navigation.navigate("Notification");
                  }}
                />
              </View> */}
            </View>
          ),
        })}
      />

      <BottomTab.Screen
        name="Chats"
        component={ChatScreenV2}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View className="flex justify-center items-center">
              <Ionicons name="chatbubbles-outline" color={color} size={size} />
              <Text className="text-white text-xs" style={{ color: color }}>
                Chats
              </Text>
            </View>
          ),
          tabBarBadge: newMsgCountStr,
        }}
      />

      <BottomTab.Screen
        name="Quests"
        component={QuestScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View className="flex justify-center items-center">
              <Ionicons name="bookmarks" color={color} size={size} />
              <Text className="text-white text-xs" style={{ color: color }}>
                Quests
              </Text>
            </View>
          ),
          headerShown: true,
          headerTitle: () => <UserHeader />,
          headerRight: () => <QuestUserPointPanel />,
          //tabBarBadge: newMsgCountStr,
        }}
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
            <View className="flex justify-center items-center">
              <Ionicons name="wallet" color={color} size={size} />
              <Text className="text-white text-xs" style={{ color: color }}>
                Wallet
              </Text>
            </View>
          ),
          headerShown: true,
          headerTitle: () => <UserHeader />,
        }}
      />
      {/* <BottomTab.Screen
        name="User"
        component={UserScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      /> */}
    </BottomTab.Navigator>
  );
};

export default function App({ isHeadless }) {
  if (isHeadless) {
    return null;
  }
  return <App_ />
}

function App_() {
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
    return () => {
      //保存页面会刷新app，此处重置event，否则会出现重复监听问题
      JSEvent.reset();
      ServiceCenter.Inst.onAppDestroyed();
      // unsubscribe on unmount
      subscriber();
    };
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
    <>
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
                gestureEnabled: false,
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
                name="MainNavigation" // This is the combined BottomTab + Drawer navigation
                component={DrawerNavigation}
                options={{ headerShown: false }}
              />
              {/* <Stack.Screen
              name="BottomTab"
              component={BottomTabNavigation}
              options={{ headerShown: false }}
            /> */}
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
                  headerTitleAlign: "center",
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
                      <HighlightButton
                        type="opacity"
                        text="Go to Sign in"
                        onPress={() => {
                          navigation.navigate("Login");
                          firebase.auth().signOut();
                        }}
                      />
                    );
                  },
                }}
              />
              <Stack.Screen
                name="CreateName"
                component={CreateNameScreen}
                options={{
                  headerBackVisible: false,
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="Notification"
                component={NotificationScreen}
                options={{ headerTintColor: "white" }}
              />
              <Stack.Screen
                name="FriendRequest"
                component={FriendRequestScreen}
                options={{ headerTitle: "Friend Request" }}
              />
              <Stack.Screen
                name="FriendSearch"
                component={FriendSearchScreen}
                options={{
                  headerTitle: "Friend Search",
                  headerTintColor: "white",
                }}
              />
              <Stack.Screen
                name="GroupCreate"
                component={GroupCreateScreen}
                options={{
                  headerTitle: "Create a Group",
                  headerTintColor: "white",
                }}
              />
              <Stack.Screen
                name="FriendAdd"
                component={FriendAddScreen}
                options={{
                  headerTitle: "Add a Friend",
                  headerTintColor: "white",
                }}
              />
              <Stack.Screen
                name="GroupInfo"
                component={GroupInfoScreen}
                options={{
                  headerTitle: "Group Information",
                  headerTintColor: "white",
                }}
              />
              <Stack.Screen
                name="GroupInvite"
                component={GroupInviteScreen}
                options={{
                  headerTitle: "Invite Friends",
                  headerTintColor: "white",
                }}
              />
              <Stack.Screen
                name="MyProfile"
                component={MyProfileScreen}
                options={{
                  headerTitle: "My Profile",
                  headerTintColor: "white",
                }}
              />
              <Stack.Screen
                name="NotificationDetail"
                component={NotificationDetailScreen}
                options={{
                  headerTitle: "Notification",
                  headerTintColor: "white",
                }}
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
      <Toast config={toastConfig} />
    </>
  );
}

const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#58AE69' }}
      text1Style={{
        fontSize: 16
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      text1Style={{
        fontSize: 16
      }}
      text2Style={{
        fontSize: 14
      }}
    />
  )
}
