import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "../Screens/Home";

const BottomTab = createBottomTabNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <BottomTab.Navigator>
        <BottomTab.Screen name="Home" component={Home} />
        <BottomTab.Screen />
        <BottomTab.Screen />
        <BottomTab.Screen />
        <BottomTab.Screen />
      </BottomTab.Navigator>
    </NavigationContainer>
  );
}
