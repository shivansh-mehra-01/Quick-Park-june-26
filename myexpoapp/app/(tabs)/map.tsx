import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Image, Dimensions, SafeAreaView, StatusBar, Platform } from "react-native";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import ParkingMap from "../../components/ParkingMap";
import { fetchNearbyParkingApi } from "../../services/parkingService";
import { useRouter } from "expo-router";
import { useTheme } from "../../context/ThemeContext";

const { width, height } = Dimensions.get("window");
const statusBarHeight = StatusBar.currentHeight || (Platform.OS === "ios" ? 44 : 20);

export default function MapTab() {
  const [location, setLocation] = useState<any>(null);
  const [parkings, setParkings] = useState<any[]>([]);
  const [selectedParking, setSelectedParking] = useState<any>(null);
  const router = useRouter();
  const { colors, theme } = useTheme();

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
        <View style={[styles.searchBar, { backgroundColor: theme === 'dark' ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.95)', borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <Text style={[styles.searchText, { color: colors.textSecondary }]}>Search for parking...</Text>
        </View>
      </View>

      {/* Adjusted Map Controls */}
      <View style={[styles.controls, { top: statusBarHeight + 80 }]}>
        <TouchableOpacity style={[styles.controlBtn, { backgroundColor: colors.card }]}>
          <Ionicons name="locate" size={24} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlBtn, { marginTop: 12, backgroundColor: colors.card }]}>
          <Ionicons name="layers" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Slim & Modern Selected Parking Card */}
      {selectedParking && (
        <TouchableOpacity 
          style={[styles.slimCard, { backgroundColor: colors.card }]}
          onPress={() => router.push(`/parking/${selectedParking.id}`)}
        >
          <Image source={{ uri: selectedParking.image }} style={styles.slimImage} />
          <View style={styles.slimInfo}>
            <View style={styles.cardHeader}>
              <Text style={[styles.slimName, { color: colors.text }]} numberOfLines={1}>{selectedParking.name}</Text>
              <View style={[styles.ratingBadge, { backgroundColor: colors.warning + "20" }]}>
                <Ionicons name="star" size={12} color={colors.warning} />
                <Text style={[styles.ratingText, { color: colors.warning }]}>{selectedParking.rating}</Text>
              </View>
            </View>
            <View style={styles.slimFooter}>
              <Text style={[styles.slimPrice, { color: colors.primary }]}>{selectedParking.price}</Text>
              <View style={styles.availability}>
                <View style={[styles.dot, { backgroundColor: colors.success }]} />
                <Text style={[styles.availabilityText, { color: colors.textSecondary }]}>{selectedParking.availableSlots} available</Text>
              </View>
            </View>
          </View>
          <View style={styles.arrowIcon}>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
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
  },
  searchText: { marginLeft: 10, fontSize: 15 },
  controls: {
    position: "absolute",
    right: 20,
    zIndex: 100
  },
  controlBtn: {
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
  slimName: { fontSize: 16, fontWeight: "bold", flex: 1 },
  ratingBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  ratingText: { fontSize: 12, fontWeight: "bold" },
  slimFooter: { flexDirection: "row", justifyContent: "space-between", marginTop: 6, alignItems: "center" },
  slimPrice: { fontSize: 14, fontWeight: "bold" },
  availability: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  availabilityText: { fontSize: 12, fontWeight: "600" },
  arrowIcon: { paddingLeft: 4 }
});
