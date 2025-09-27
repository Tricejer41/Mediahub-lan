import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import Row from "../components/Row";
import { Api } from "../lib/api";
import type { TitleSummary } from "../lib/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function Home({ route, navigation }: Props) {
  const { profile } = route.params;
  const [items, setItems] = useState<TitleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    Api.listSeries()
      .then((list) => {
        if (cancel) return;
        setItems(list);
      })
      .catch(() => !cancel && setError("No se pudo cargar el catálogo"))
      .finally(() => !cancel && setLoading(false));
    return () => { cancel = true; };
  }, []);

  const openDetails = (id: string) =>
    navigation.navigate("Details", { id, profileId: profile.id });

  return (
    <View style={styles.root}>
      <Text style={styles.header}>Hola, {profile.name}</Text>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" /></View>
      ) : error ? (
        <View style={styles.center}><Text style={styles.error}>{error}</Text></View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Row title="Todas las series" items={items} onPressItem={openDetails} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "black", paddingTop: 32 },
  header: { color: "white", fontSize: 22, marginLeft: 16, marginBottom: 12 },
  content: { paddingHorizontal: 16, paddingBottom: 32 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  error: { color: "#f66", fontSize: 16 },
});
