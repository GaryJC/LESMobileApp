import { registerRootComponent } from 'expo';
import messaging from "@react-native-firebase/messaging"
import App from './App';
import notifee from "@notifee/react-native";

if (!__DEV__) {
    //非开发环境关闭console.log
    console.log = () => { };
}

messaging().onMessage(async message => {

})
messaging().setBackgroundMessageHandler(async message => {
    console.log("got background message=====", message);
    const { title, body, priority, channelId } = message.data;
    // const channel = message.notification.android.channelId;
    //await this.displayMessage(message);
    notifee.displayNotification({
        title: title,
        body: body,
        android: {
            channelId: channelId ?? "",
            autoCancel: true,
            pressAction: {
                id: "default",
                launchActivity: 'default',
            },
        }
    })
    notifee.incrementBadgeCount();
})

notifee.onBackgroundEvent(async message => {

})

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
