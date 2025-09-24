import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SelectProfile from "../screens/SelectProfile";
import Home from "../screens/Home";
import Details from "../screens/Details";
import Player from "../screens/Player";

export type RootStackParamList = {
  SelectProfile: undefined;
  Home: { profile: { id: number; name: string } };
  Details: { id: string; profileId: number };
  Player: { sourceId: string; profileId: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SelectProfile"
        screenOptions={{ headerShown: false, animation: "fade" }}
      >
        <Stack.Screen name="SelectProfile" component={SelectProfile} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Details" component={Details} />
        <Stack.Screen name="Player" component={Player} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
