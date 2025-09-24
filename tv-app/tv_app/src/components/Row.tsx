import React from "react";
import { View, Text, FlatList, Image, StyleSheet } from "react-native";
import Focusable from "./Focusable";

type Item = { id: string; name: string; poster?: string };
type Props = { title: string; items: Item[]; onPressItem: (id: string) => void };

export default function Row({ title, items, onPressItem }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        horizontal
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => (
          <Focusable style={styles.card} onPress={() => onPressItem(item.id)}>
            <View style={styles.posterBox}>
              {item.poster ? (
                <Image source={{ uri: item.poster }} style={styles.poster} />
              ) : (
                <View style={[styles.poster, styles.posterPlaceholder]} />
              )}
            </View>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
          </Focusable>
        )}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  title: { color: "white", fontSize: 22, marginBottom: 8, marginLeft: 8 },
  card: { marginRight: 12, width: 180 },
  posterBox: { width: 180, height: 270, marginBottom: 8, overflow: "hidden", borderRadius: 12 },
  poster: { width: "100%", height: "100%" },
  posterPlaceholder: { backgroundColor: "rgba(255,255,255,0.15)" },
  name: { color: "white", fontSize: 16 },
});
