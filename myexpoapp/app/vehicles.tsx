import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Platform, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const statusBarHeight = StatusBar.currentHeight || (Platform.OS === "ios" ? 44 : 20);

export default function VehiclesScreen() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState([
    { id: "1", type: "Car", plate: "MH04 JM 8765", default: true },
    { id: "2", type: "Bike", plate: "MP04 AB 1234", default: false }
  ]);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={item.type === "Car" ? "car-outline" : "bicycle-outline"} size={24} color="#3b82f6" />
        </View>
        <View>
          <Text style={styles.plate}>{item.plate}</Text>
          <Text style={styles.type}>{item.type}</Text>
        </View>
      </View>
      {item.default && (
        <View style={styles.defaultBadge}>
          <Text style={styles.defaultText}>Default</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: Platform.OS === "android" ? statusBarHeight + 10 : 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Vehicles</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={vehicles}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />

      <TouchableOpacity style={styles.addBtn}>
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.addBtnText}>Add New Vehicle</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9"
  },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#1e293b" },
  list: { padding: 20 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8
  },
  cardLeft: { flexDirection: "row", alignItems: "center" },
  iconContainer: { backgroundColor: "#eff6ff", padding: 12, borderRadius: 12, marginRight: 16 },
  plate: { fontSize: 18, fontWeight: "bold", color: "#1e293b" },
  type: { fontSize: 14, color: "#64748b", marginTop: 4 },
  defaultBadge: { backgroundColor: "#dcfce7", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  defaultText: { color: "#16a34a", fontSize: 12, fontWeight: "bold" },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f6",
    margin: 20,
    padding: 18,
    borderRadius: 20,
    gap: 8
  },
  addBtnText: { color: "white", fontSize: 18, fontWeight: "bold" }
});
