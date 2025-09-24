import React, { useRef, useState } from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";

type Props = {
  children?: React.ReactNode;
  onPress?: () => void;
  style?: any;
  label?: string;
};

export default function Focusable({ children, onPress, style, label }: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      focusable
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onPress={onPress}
      style={[styles.base, focused && styles.focused, style]}
    >
      {children ? children : <Text style={styles.text}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  focused: {
    borderWidth: 3,
    borderColor: "white",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  text: { color: "white", fontSize: 20 },
});
