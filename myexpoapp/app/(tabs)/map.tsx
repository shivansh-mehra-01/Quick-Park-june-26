import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Image, Dimensions, SafeAreaView, StatusBar, Platform, Linking } from "react-native";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import ParkingMap from "../../components/ParkingMap";
import { fetchNearbyParkingApi, fetchRouteApi } from "../../services/parkingService";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "../../context/ThemeContext";

const { width, height } = Dimensions.get("window");
const statusBarHeight = StatusBar.currentHeight || (Platform.OS === "ios" ? 44 : 20);

export default function MapTab() {
  const [location, setLocation] = useState<any>(null);
  const [parkings, setParkings] = useState<any[]>([]);
  const [selectedParking, setSelectedParking] = useState<any>(null);
  const [routeCoords, setRouteCoords] = useState<any[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navDetails, setNavDetails] = useState<{distance: number, duration: number} | null>(null);
  const router = useRouter();
  const { navigateTo } = useLocalSearchParams();
  const { colors, theme } = useTheme();
  const mapRef = useRef<any>(null);
  const liveLocRef = useRef<any>(null);
  const locationSub = useRef<any>(null);

  useEffect(() => {
    async function init() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        const currentLoc = { latitude: loc.coords.latitude, longitude: loc.coords.longitude, heading: loc.coords.heading || 0 };
        setLocation(currentLoc);
        liveLocRef.current = currentLoc;
        
        const data = await fetchNearbyParkingApi(currentLoc.latitude, currentLoc.longitude);
        setParkings(data);
        if (data.length > 0) {
          setSelectedParking(data[0]);
          setTimeout(() => {
            const coords = data.map((p: any) => ({ latitude: p.lat, longitude: p.lon }));
            coords.push(currentLoc);
            mapRef.current?.fitToCoordinates(coords, {
              edgePadding: { top: 100, right: 50, bottom: 200, left: 50 },
              animated: true
            });
          }, 500);
        }

        locationSub.current = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 5 },
          (newLoc) => {
             const newCoords = { latitude: newLoc.coords.latitude, longitude: newLoc.coords.longitude, heading: newLoc.coords.heading || 0 };
             setLocation(newCoords);
             liveLocRef.current = newCoords;
          }
        );
      }
    }
    init();

    return () => {
      if (locationSub.current) locationSub.current.remove();
    };
  }, []);

  // Poll for real-time parking slots updates in the background
  useEffect(() => {
    let interval: any;
    if (location && !isNavigating) {
      interval = setInterval(async () => {
        try {
          const data = await fetchNearbyParkingApi(location.latitude, location.longitude);
          setParkings(data);
        } catch (err) {
          console.log("Real-time slots polling error:", err);
        }
      }, 8000);
    }
    return () => clearInterval(interval);
  }, [location, isNavigating]);

  // Handle incoming navigation requests from other screens
  useEffect(() => {
    async function startExternalNav() {
      if (navigateTo && parkings.length > 0 && liveLocRef.current && !isNavigating) {
        const p = parkings.find(x => x.id === navigateTo);
        if (p) {
          setSelectedParking(p);
          const routeData = await fetchRouteApi(
            { latitude: liveLocRef.current.latitude, longitude: liveLocRef.current.longitude },
            { latitude: p.lat, longitude: p.lon }
          );
          setRouteCoords(routeData.coords);
          setNavDetails({ distance: routeData.distance, duration: routeData.duration });
          setIsNavigating(true);
        }
      }
    }
    startExternalNav();
  }, [navigateTo, parkings]);

  // Recalculate route periodically during navigation
  useEffect(() => {
    let interval: any;
    if (isNavigating && selectedParking) {
      interval = setInterval(async () => {
        if (!liveLocRef.current) return;
        const routeData = await fetchRouteApi(
          { latitude: liveLocRef.current.latitude, longitude: liveLocRef.current.longitude },
          { latitude: selectedParking.lat, longitude: selectedParking.lon }
        );
        setRouteCoords(routeData.coords);
        setNavDetails({ distance: routeData.distance, duration: routeData.duration });
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [isNavigating, selectedParking]);

  // Animate Camera to follow user
  useEffect(() => {
    if (isNavigating && location && mapRef.current) {
      mapRef.current.animateCamera({
        center: location,
        pitch: 60,
        heading: location.heading > 0 ? location.heading : undefined,
        zoom: 18
      }, { duration: 1000 });
    }
  }, [location, isNavigating]);

  if (!location) return null;

  return (
    <View style={styles.container}>
      {/* Full Screen Map */}
      <View style={styles.mapContainer}>
        <ParkingMap 
          location={location} 
          parkings={isNavigating ? [selectedParking] : parkings} 
          routeCoords={routeCoords} 
          mapRef={mapRef}
          onMarkerPress={(p) => {
            if (isNavigating) return;
            setSelectedParking(p);
            setRouteCoords([]);
            setNavDetails(null);
            mapRef.current?.animateToRegion({
              latitude: p.lat,
              longitude: p.lon,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01
            }, 500);
          }}
        />
      </View>
      
      {/* Active Navigation Header */}
      {isNavigating && navDetails && (
        <View style={[styles.navHeader, { backgroundColor: colors.card, borderColor: colors.border, top: statusBarHeight + 10 }]}>
          <View style={styles.navHeaderInner}>
            <Ionicons name="navigate-circle" size={40} color={colors.primary} />
            <View style={{ marginLeft: 15, flex: 1 }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }}>
                {(() => {
                  const totalMinutes = Math.ceil(navDetails.duration / 60);
                  if (totalMinutes >= 60) {
                    const hrs = Math.floor(totalMinutes / 60);
                    const mins = totalMinutes % 60;
                    return mins > 0 ? `${hrs} hr ${mins} min` : `${hrs} hr`;
                  }
                  return `${totalMinutes} min`;
                })()}
              </Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary, fontWeight: '600' }}>
                {(navDetails.distance / 1000).toFixed(1)} km • {selectedParking.name}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.closeNavBtn}
              onPress={() => {
                setIsNavigating(false);
                setRouteCoords([]);
                setNavDetails(null);
                mapRef.current?.animateCamera({ pitch: 0, heading: 0, zoom: 14 }, { duration: 1000 });
              }}
            >
              <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Notch-Aware Floating Search Bar (hidden during nav) */}
      {!isNavigating && (
        <View style={[styles.searchOverlay, { top: statusBarHeight + 10 }]}>
          <View style={[styles.searchBar, { backgroundColor: theme === 'dark' ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.95)', borderColor: colors.border }]}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <Text style={[styles.searchText, { color: colors.textSecondary }]}>Search for parking...</Text>
          </View>
        </View>
      )}

      {/* Adjusted Map Controls (hidden during nav) */}
      {!isNavigating && (
        <View style={[styles.controls, { top: statusBarHeight + 80 }]}>
          <TouchableOpacity 
            style={[styles.controlBtn, { backgroundColor: colors.card }]}
            onPress={() => {
              mapRef.current?.animateToRegion({
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01
              }, 1000);
            }}
          >
            <Ionicons name="locate" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.controlBtn, { marginTop: 12, backgroundColor: colors.card }]}>
            <Ionicons name="layers" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Sleek Floating Navigation Card */}
      {selectedParking && !isNavigating && (
        <View style={[styles.selectedCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity 
            style={styles.closeCardBtn} 
            onPress={() => { setSelectedParking(null); setRouteCoords([]); }}
          >
            <Ionicons name="close-circle" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={[styles.selectedName, { color: colors.text }]} numberOfLines={1}>
            {selectedParking.name}
          </Text>
          <Text style={[styles.selectedAvailability, { color: colors.primary }]}>
            {selectedParking.availableSlots} / {selectedParking.totalSlots} slots available
          </Text>
          <View style={styles.navButtons}>
            <TouchableOpacity 
              style={[styles.navBtn, { backgroundColor: colors.primary }]} 
              onPress={async () => {
                const routeData = await fetchRouteApi(
                  { latitude: location.latitude, longitude: location.longitude },
                  { latitude: selectedParking.lat, longitude: selectedParking.lon }
                );
                setRouteCoords(routeData.coords);
                setNavDetails({ distance: routeData.distance, duration: routeData.duration });
                setIsNavigating(true);
              }}
            >
              <Ionicons name="navigate" size={16} color="white" />
              <Text style={styles.navBtnText}>In-App Route</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.navBtn, { backgroundColor: '#4285F4' }]} 
              onPress={() => {
                const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedParking.lat},${selectedParking.lon}`;
                Linking.openURL(url);
              }}
            >
              <Ionicons name="map" size={16} color="white" />
              <Text style={styles.navBtnText}>Google Maps</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  mapContainer: { ...StyleSheet.absoluteFillObject },
  navHeader: {
    position: 'absolute',
    left: 15,
    right: 15,
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    zIndex: 100
  },
  navHeaderInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  closeNavBtn: {
    padding: 5
  },
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
  selectedCard: {
    position: 'absolute',
    bottom: 110,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    zIndex: 100
  },
  closeCardBtn: { position: 'absolute', top: 10, right: 10, zIndex: 30 },
  selectedName: { fontSize: 18, fontWeight: 'bold', marginRight: 25 },
  selectedAvailability: { fontSize: 13, fontWeight: '600', marginTop: 5, marginBottom: 15 },
  navButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  navBtn: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6
  },
  navBtnText: { color: 'white', fontWeight: 'bold', fontSize: 13 }
});
