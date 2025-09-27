import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, FlatList, Image, Alert } from "react-native";
import Focusable from "../components/Focusable";
import { Api } from "../lib/api";
import { resolveAvatar, AVATAR_IDS } from "../lib/avatars";
import { useNavigation } from "@react-navigation/native";

export default function CreateProfile() {
  const nav = useNavigation<any>();
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string>(AVATAR_IDS[0]);

  const canSave = name.trim().length >= 2;

  const save = async () => {
    if (!canSave) return;
    try {
      const profile = await Api.createProfile({ name: name.trim(), avatar: selected });
      nav.navigate("Home", { profile });
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "No se pudo crear el perfil");
    }
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Crear perfil</Text>

      <Text style={styles.label}>Nombre</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Ej. Marc"
        placeholderTextColor="#888"
      />

      <Text style={[styles.label, { marginTop: 20 }]}>Avatar</Text>
      <FlatList
        data={AVATAR_IDS}
        keyExtractor={(k) => k}
        numColumns={4}
        columnWrapperStyle={{ justifyContent: "flex-start" }}
        contentContainerStyle={{ paddingVertical: 10 }}
        renderItem={({ item, index }) => (
          <Focusable
            style={[styles.avatarCard, item === selected && styles.avatarCardActive]}
            autoFocus={index === 0}
            onPress={() => setSelected(item)}
          >
            <Image source={resolveAvatar(item)} style={styles.avatar} />
          </Focusable>
        )}
      />

      <View style={{ height: 24 }} />
      <Focusable onPress={save} style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]} disabled={!canSave}>
        <Text style={styles.saveText}>Guardar y continuar</Text>
      </Focusable>
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
    marginBottom: 16,
  },
  label: {
    color: "#dcdcdc",
    fontSize: 20,
    marginBottom: 6,
  },
  input: {
    height: 56,
    backgroundColor: "#161616",
    borderColor: "#2b2b2b",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    color: "white",
    fontSize: 20,
  },
  avatarCard: {
    width: 140,
    height: 140,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "#1a1a1a",
  },
  avatarCardActive: {
    borderColor: "#ffffff",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  saveBtn: {
    width: 360,
    height: 64,
    borderRadius: 16,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveText: {
    color: "#0b0b0b",
    fontSize: 20,
    fontWeight: "700",
  },
});
