import { resolveAvatar, AVATAR_IDS } from "../lib/avatars";
import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, FlatList, TextInput } from "react-native";
import Focusable from "../components/Focusable";
import { Api } from "../lib/api";
import type { Profile } from "../lib/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation";

type Props = NativeStackScreenProps<RootStackParamList, "SelectProfile">;

export default function SelectProfile({ navigation }: Props) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [avatars, setAvatars] = useState<string[]>([]);

  useEffect(() => {
    Api.listProfiles().then(setProfiles).catch(console.warn);
    // Avatares: usamos estáticos servidos por backend (/static/avatars)
    // Si tienes endpoint para listarlos, cámbialo; sino, carga una lista fija o
    // infiérela desde tus nombres:
    const preset = [
      "/static/avatars/1.png",
      "/static/avatars/2.png",
      "/static/avatars/3.png",
      "/static/avatars/4.png",
    ];
    setAvatars(preset);
  }, []);

  const go = (profile: Profile) => navigation.replace("Home", { profile: { id: profile.id, name: profile.name } });

  const create = async () => {
    if (!name || !selectedAvatar) return;
    const p = await Api.createProfile(name, selectedAvatar);
    setProfiles((prev) => [...prev, p]);
    setName("");
    setSelectedAvatar(null);
  };

  return (
    <View style={styles.root}>
      <Text style={styles.h1}>¿Quién está viendo?</Text>

      <FlatList
        contentContainerStyle={{ paddingVertical: 12 }}
        data={profiles}
        numColumns={4}
        keyExtractor={(p) => String(p.id)}
        renderItem={({ item }) => (
          <Focusable style={styles.profileCard} onPress={() => go(item)}>
<Image source={resolveAvatar(item.avatar)} style={styles.avatar} />
            <Text style={styles.profileName} numberOfLines={1}>{item.name}</Text>
          </Focusable>
        )}
      />

      <View style={styles.createBox}>
        <Text style={styles.h2}>Crear perfil</Text>
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            placeholderTextColor="#aaa"
            value={name}
            onChangeText={setName}
          />
          <Focusable
            style={[styles.createBtn, !(name && selectedAvatar) && { opacity: 0.5 }]}
            onPress={create}
          >
            <Text style={styles.createText}>Crear</Text>
          </Focusable>
        </View>
        <Text style={styles.h3}>Elige un avatar</Text>
        <FlatList
          horizontal
          data={avatars}
          keyExtractor={(x) => x}
          renderItem={({ item }) => (
            <Focusable
              style={[
                styles.avatarPick,
                selectedAvatar === item && { borderColor: "white", borderWidth: 3 },
              ]}
              onPress={() => setSelectedAvatar(item)}
            >
<Image source={resolveAvatar(item)} style={styles.avatarPickImg} />
            </Focusable>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "black", paddingHorizontal: 24, paddingTop: 48 },
  h1: { color: "white", fontSize: 36, marginBottom: 16 },
  h2: { color: "white", fontSize: 24, marginVertical: 8 },
  h3: { color: "white", fontSize: 18, marginTop: 16, marginBottom: 8 },
  profileCard: { width: 220, margin: 8, alignItems: "center" },
  avatar: { width: 160, height: 160, borderRadius: 12, marginBottom: 8 },
  profileName: { color: "white", fontSize: 18 },
  createBox: { marginTop: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  input: {
    flex: 1, color: "white", fontSize: 18, padding: 12,
    borderWidth: 1, borderColor: "#555", borderRadius: 10, backgroundColor: "#1a1a1a"
  },
  createBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10 },
  createText: { color: "white", fontSize: 18 },
  avatarPick: { width: 120, height: 120, borderRadius: 12, overflow: "hidden", marginRight: 12 },
  avatarPickImg: { width: "100%", height: "100%" },
});
