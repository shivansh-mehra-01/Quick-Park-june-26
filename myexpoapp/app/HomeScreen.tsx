import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import * as Location from "expo-location";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import ParkingMap from "../components/ParkingMap";
import ParkingList from "../components/ParkingList";
import Footer from "../components/Footer";
import { fetchNearbyParkingApi, fetchRouteApi } from "../services/parkingService";

export default function MapScreen({ children }: { children?: React.ReactNode }) {
  const [location, setLocation] = useState<any>(null);
  const [parkings, setParkings] = useState<any[]>([]);
  const [routeCoords, setRouteCoords] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function startTracking() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission denied");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});

      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude
      });

      try {
        const data = await fetchNearbyParkingApi(loc.coords.latitude, loc.coords.longitude);
        setParkings(data);
      } catch (error) {
        console.log("Parking fetch error:", error);
      }
    }

    startTracking();
  }, []);

  // Polling for real-time status of the list
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // Fetch all parkings again to get updated slots
        const data = await fetchNearbyParkingApi(location?.latitude || 0, location?.longitude || 0);
        if (data.length > 0) {
          setParkings(data);
        }
      } catch (error) {
        console.log("Status polling error:", error);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [location]);

  async function handleSelectParking(parking: any) {
    if (!location) return;
    try {
      setRouteCoords([]);
      const start = { latitude: location.latitude, longitude: location.longitude };
      const end = { latitude: parking.lat, longitude: parking.lon };
      
      const coords = await fetchRouteApi(start, end);
      setRouteCoords(coords);
    } catch (err) {
      console.log("Route error:", err);
    }
  }

  if (!location) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        {children}
        <TouchableOpacity 
          style={styles.historyBtn}
          onPress={() => router.push("/history")}
        >
          <Ionicons name="time" size={24} color="#3b82f6" />
          <Text style={styles.historyText}>History</Text>
        </TouchableOpacity>
      </View>
      
      <ParkingMap
        location={location}
        parkings={parkings}
        routeCoords={routeCoords}
      />
      
      <View style={styles.titleContainer}>
        <Text style={styles.title}>
          Nearest Parkings ({parkings.length})
        </Text>
      </View>

      <ParkingList
        parkings={parkings}
        location={location}
        onSelectParking={handleSelectParking}
      />
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5"
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    paddingTop: 10
  },
  historyBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 20,
    paddingTop: 45
  },
  historyText: {
    marginLeft: 5,
    color: "#3b82f6",
    fontWeight: "bold"
  },
  titleContainer: {
    paddingHorizontal: 15, 
    paddingBottom: 10, 
    paddingTop: 15 
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  }
});