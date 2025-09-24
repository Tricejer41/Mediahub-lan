import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, FlatList } from "react-native";
import Focusable from "../components/Focusable";
import { Api } from "../lib/api";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Details">;

export default function Details({ route, navigation }: Props) {
  const { id, profileId } = route.params;
  const [data, setData] = useState<Awaited<ReturnType<typeof Api.getDetails>> | null>(null);

  useEffect(() => {
    Api.getDetails(id).then(setData).catch(console.warn);
  }, [id]);

  const play = (sourceId: string) => navigation.navigate("Player", { sourceId, profileId });

  if (!data) return <View style={styles.root}><Text style={styles.txt}>Cargando…</Text></View>;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        {data.poster ? <Image source={{ uri: data.poster }} style={styles.poster} /> : <View style={[styles.poster, styles.posterPh]} />}
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={styles.title}>{data.name}</Text>
          {!!data.synopsis && <Text style={styles.synopsis}>{data.synopsis}</Text>}
        </View>
      </View>

      {/* Episodios (ejemplo simple: 1ª temporada si existe) */}
      {data.seasons?.length ? (
        <>
          <Text style={styles.seasonTitle}>Episodios</Text>
          <FlatList
            data={data.seasons[0].episodes}
            keyExtractor={(e) => e.id}
            renderItem={({ item }) => (
              <Focusable style={styles.epCard} onPress={() => play(item.id)}>
                <Text style={styles.epName} numberOfLines={1}>{item.name}</Text>
              </Focusable>
            )}
          />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "black", padding: 16 },
  txt: { color: "white" },
  header: { flexDirection: "row", marginBottom: 16 },
  poster: { width: 240, height: 360, borderRadius: 12 },
  posterPh: { backgroundColor: "rgba(255,255,255,0.1)" },
  title: { color: "white", fontSize: 28, marginBottom: 8 },
  synopsis: { color: "#ddd", fontSize: 16 },
  seasonTitle: { color: "white", fontSize: 22, marginTop: 12, marginBottom: 8 },
  epCard: { padding: 12, marginVertical: 6, borderRadius: 10 },
  epName: { color: "white", fontSize: 18 },
});
