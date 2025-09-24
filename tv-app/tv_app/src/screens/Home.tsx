import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import Row from "../components/Row";
import { Api } from "../lib/api";
import type { TitleSummary } from "../lib/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function Home({ route, navigation }: Props) {
  const { profile } = route.params;
  const [rows, setRows] = useState<{ label: string; items: TitleSummary[] }[]>([]);
  const [cw, setCw] = useState<{ label: string; items: TitleSummary[] } | null>(null);

  useEffect(() => {
    Api.listHome()
      .then((data) => setRows(data.rows || []))
      .catch(() => setRows([]));

    Api.listContinueWatching(profile.id)
      .then((items) => setCw({ label: "Seguir viendo", items }))
      .catch(() => setCw(null)); // si aún no existe en backend, se oculta
  }, [profile.id]);

  const openDetails = (id: string) => navigation.navigate("Details", { id, profileId: profile.id });

  return (
    <View style={styles.root}>
      <Text style={styles.header}>Hola, {profile.name}</Text>
      <ScrollView contentContainerStyle={styles.content}>
        {cw && <Row title={cw.label} items={cw.items} onPressItem={openDetails} />}
        {rows.map((r) => (
          <Row key={r.label} title={r.label} items={r.items} onPressItem={openDetails} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "black", paddingTop: 32 },
  header: { color: "white", fontSize: 22, marginLeft: 16, marginBottom: 12 },
  content: { paddingHorizontal: 16, paddingBottom: 32 },
});
