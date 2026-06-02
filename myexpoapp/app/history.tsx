import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from "react-native";
import { fetchUserHistoryApi } from "../services/parkingService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function HistoryScreen() {
  const [history, setHistory] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchUserHistoryApi().then(setHistory);
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.parkingName}>{item.parkingName}</Text>
        <Text style={styles.cost}>{item.cost}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.row}>
          <Ionicons name="car-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{item.plate}</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{item.duration} ({item.date})</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Parking History</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No history found</Text>}
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
    padding: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee"
  },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  list: { padding: 15 },
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
  cost: { fontSize: 16, fontWeight: "bold", color: "#2ecc71" },
  cardBody: { borderTopWidth: 1, borderTopColor: "#f0f0f0", paddingTop: 10 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  infoText: { marginLeft: 8, color: "#666", fontSize: 14 },
  empty: { textAlign: "center", marginTop: 50, color: "#999" }
});
