import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Image, Dimensions, SafeAreaView, StatusBar, Platform } from "react-native";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import ParkingMap from "../../components/ParkingMap";
import { fetchNearbyParkingApi } from "../../services/parkingService";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");
const statusBarHeight = StatusBar.currentHeight || (Platform.OS === "ios" ? 44 : 20);

export default function MapTab() {
  const [location, setLocation] = useState<any>(null);
  const [parkings, setParkings] = useState<any[]>([]);
  const [selectedParking, setSelectedParking] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function init() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        const currentLoc = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        setLocation(currentLoc);
        const data = await fetchNearbyParkingApi(currentLoc.latitude, currentLoc.longitude);
        setParkings(data);
        if (data.length > 0) setSelectedParking(data[0]);
      }
    }
    init();
  }, []);

  if (!location) return null;

  return (
    <View style={styles.container}>
      {/* Full Screen Map */}
      <View style={styles.mapContainer}>
        <ParkingMap 
          location={location} 
          parkings={parkings} 
          routeCoords={[]} 
        />
      </View>
      
      {/* Notch-Aware Floating Search Bar */}
      <View style={[styles.searchOverlay, { top: statusBarHeight + 10 }]}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#94a3b8" />
          <Text style={styles.searchText}>Search for parking...</Text>
        </View>
      </View>

      {/* Adjusted Map Controls */}
      <View style={[styles.controls, { top: statusBarHeight + 80 }]}>
        <TouchableOpacity style={styles.controlBtn}>
          <Ionicons name="locate" size={24} color="#3b82f6" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlBtn, { marginTop: 12 }]}>
          <Ionicons name="layers" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {/* Slim & Modern Selected Parking Card */}
      {selectedParking && (
        <TouchableOpacity 
          style={styles.slimCard}
          onPress={() => router.push(`/parking/${selectedParking.id}`)}
        >
          <Image source={{ uri: selectedParking.image }} style={styles.slimImage} />
          <View style={styles.slimInfo}>
            <View style={styles.cardHeader}>
              <Text style={styles.slimName} numberOfLines={1}>{selectedParking.name}</Text>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color="#fbbf24" />
                <Text style={styles.ratingText}>{selectedParking.rating}</Text>
              </View>
            </View>
            <View style={styles.slimFooter}>
              <Text style={styles.slimPrice}>{selectedParking.price}</Text>
              <View style={styles.availability}>
                <View style={styles.dot} />
                <Text style={styles.availabilityText}>{selectedParking.availableSlots} available</Text>
              </View>
            </View>
          </View>
          <View style={styles.arrowIcon}>
            <Ionicons name="chevron-forward" size={24} color="#cbd5e1" />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  mapContainer: { ...StyleSheet.absoluteFillObject },
  searchOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    zIndex: 100
  },
  searchBar: {
    backgroundColor: "rgba(255,255,255,0.98)",
    height: 52,
    borderRadius: 26,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: "#f1f5f9"
  },
  searchText: { marginLeft: 10, color: "#94a3b8", fontSize: 15 },
  controls: {
    position: "absolute",
    right: 20,
    zIndex: 100
  },
  controlBtn: {
    backgroundColor: "white",
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  slimCard: {
    position: "absolute",
    bottom: 110,
    left: 15,
    right: 15,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 15,
    zIndex: 100
  },
  slimImage: { width: 60, height: 60, borderRadius: 12 },
  slimInfo: { flex: 1, marginLeft: 12, marginRight: 8 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  slimName: { fontSize: 16, fontWeight: "bold", color: "#1e293b", flex: 1 },
  ratingBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontSize: 12, fontWeight: "bold", color: "#d97706" },
  slimFooter: { flexDirection: "row", justifyContent: "space-between", marginTop: 6, alignItems: "center" },
  slimPrice: { fontSize: 14, color: "#3b82f6", fontWeight: "bold" },
  availability: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#16a34a" },
  availabilityText: { fontSize: 12, color: "#64748b", fontWeight: "600" },
  arrowIcon: { paddingLeft: 4 }
});
