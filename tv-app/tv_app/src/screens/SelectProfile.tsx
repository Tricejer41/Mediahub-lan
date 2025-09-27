import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Image, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import Focusable from "../components/Focusable";
import { Api } from "../lib/api";
import { Profile } from "../lib/types";
import { resolveAvatar } from "../lib/avatars";
import { useNavigation } from "@react-navigation/native";

type Item = { kind: "add" } | (Profile & { kind: "profile" });

export default function SelectProfile() {
  const nav = useNavigation<any>();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Api.getProfiles()
      .then((p) => mounted && setProfiles(p))
      .catch((e) => console.error("getProfiles()", e))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const data: Item[] = useMemo(() => {
    const items: Item[] = profiles.map((p) => ({ ...p, kind: "profile" as const }));
    if (profiles.length < 4) items.push({ kind: "add" });
    return items;
  }, [profiles]);

  const renderItem = ({ item, index }: { item: Item; index: number }) => {
    const isAdd = item.kind === "add";
    const onPress = () => {
      if (isAdd) nav.navigate("CreateProfile");
      else nav.navigate("Home", { profile: item });
    };
    return (
      <Focusable style={[styles.card, isAdd && styles.addCard]} onPress={onPress} autoFocus={index === 0}>
        {isAdd ? (
          <View style={styles.addInner}>
            <Text style={styles.plus}>＋</Text>
            <Text style={styles.addText}>Añadir perfil</Text>
          </View>
        ) : (
          <>
            <Image source={resolveAvatar(item.avatar)} style={styles.avatar} resizeMode="cover" />
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          </>
        )}
      </Focusable>
    );
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>¿Quién está viendo?</Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(it, idx) => (it.kind === "add" ? "add" : String(it.id))}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0b0b0b",
    paddingTop: 40,
    paddingHorizontal: 60,
  },
  title: {
    color: "white",
    fontSize: 42,
    fontWeight: "700",
    marginBottom: 24,
  },
  grid: {
    paddingVertical: 20,
  },
  row: {
    justifyContent: "flex-start",
  },
  card: {
    width: 280,
    height: 280,
    marginRight: 32,
    marginBottom: 32,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "#1a1a1a",
  },
  addCard: {
    alignItems: "center",
    justifyContent: "center",
    borderStyle: "dashed",
    borderColor: "#3a3a3a",
    backgroundColor: "transparent",
  },
  avatar: {
    width: "100%",
    height: "85%",
  },
  name: {
    color: "white",
    fontSize: 20,
    textAlign: "center",
    paddingTop: 8,
  },
  addInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  plus: {
    fontSize: 80,
    color: "#d1d1d1",
    marginBottom: 8,
  },
  addText: {
    color: "#d1d1d1",
    fontSize: 22,
  },
});
