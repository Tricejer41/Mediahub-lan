import React, { useRef, useEffect } from "react";
import { View, StyleSheet, BackHandler } from "react-native";
import Video from "react-native-video";
import { buildHlsUrl } from "../lib/player";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Player">;

export default function Player({ route, navigation }: Props) {
  const { sourceId } = route.params;
  const videoRef = useRef<Video | null>(null);
  const src = buildHlsUrl(sourceId);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      navigation.goBack();
      return true;
    });
    return () => sub.remove();
  }, [navigation]);

  return (
    <View style={styles.root}>
      <Video
        ref={(r) => (videoRef.current = r)}
        source={{ uri: src }}
        style={styles.video}
        resizeMode="contain"
        controls
        onError={(e) => console.warn("Player error", e)}
        onEnd={() => navigation.goBack()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "black" },
  video: { flex: 1 },
});
