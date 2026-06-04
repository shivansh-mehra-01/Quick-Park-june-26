import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Platform, StatusBar } from "react-native";

const statusBarHeight = StatusBar.currentHeight || (Platform.OS === "ios" ? 44 : 20);
import { fetchUserHistoryApi } from "../services/parkingService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";

export default function HistoryScreen() {
  const [history, setHistory] = useState<any[]>([]);
  const router = useRouter();
  const { colors } = useTheme();

  useEffect(() => {
    fetchUserHistoryApi().then(setHistory);
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.parkingName, { color: colors.text }]}>{item.parkingName}</Text>
      </View>
      <View style={[styles.cardBody, { borderTopColor: colors.border }]}>
        <View style={styles.row}>
          <Ionicons name="car-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>{item.plate}</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>{item.duration} ({item.date})</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: Platform.OS === "android" ? statusBarHeight + 10 : 10, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Parking History</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={[styles.empty, { color: colors.textSecondary }]}>No history found</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee"
  },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  list: { padding: 24 },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  parkingName: { fontSize: 16, fontWeight: "bold" },
  cardBody: { borderTopWidth: 1, borderTopColor: "#f0f0f0", paddingTop: 10 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  infoText: { marginLeft: 8, color: "#666", fontSize: 14 },
  empty: { textAlign: "center", marginTop: 50, color: "#999" }
});
