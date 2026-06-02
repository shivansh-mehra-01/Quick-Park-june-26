import React, { useState, useEffect } from "react";
import { 
  View, Text, StyleSheet, ScrollView, RefreshControl, 
  SafeAreaView, TouchableOpacity, Image, Dimensions, StatusBar, Platform 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { fetchNearbyParkingApi } from "../../services/parkingService";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");
const statusBarHeight = StatusBar.currentHeight || (Platform.OS === "ios" ? 44 : 20);

export default function HomeTab() {
  const [parkings, setParkings] = useState<any[]>([]);
  const [location, setLocation] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadData = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        const data = await fetchNearbyParkingApi(loc.coords.latitude, loc.coords.longitude);
        setParkings(data);
      }
    } catch (error) {
      console.log("Load error:", error);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Notch-Aware Header Section */}
        <View style={[styles.header, { paddingTop: Platform.OS === "android" ? statusBarHeight + 10 : 10 }]}>
          <View>
            <Text style={styles.greeting}>Good Morning!</Text>
            <Text style={styles.locationLabel}>
              <Ionicons name="location" size={14} color="#3b82f6" /> Bhopal, India
            </Text>
          </View>
          <TouchableOpacity style={styles.profileBtn} onPress={() => router.push("/profile")}>
            <Image 
              source={{ uri: "https://ui-avatars.com/api/?name=Abhishek&background=3b82f6&color=fff" }} 
              style={styles.avatar} 
            />
          </TouchableOpacity>
        </View>

        {/* Search Simulation */}
        <TouchableOpacity style={styles.searchBar} onPress={() => router.push("/(tabs)/map")}>
          <Ionicons name="search" size={20} color="#94a3b8" />
          <Text style={styles.searchText}>Search for parking spots...</Text>
        </TouchableOpacity>

        {/* Featured Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Spot</Text>
          <TouchableOpacity style={styles.featuredCard}>
            <Image 
              source={{ uri: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=800" }} 
              style={styles.featuredImage} 
            />
            <View style={styles.featuredOverlay}>
              <View style={styles.glassBadge}>
                <Text style={styles.badgeText}>Premium</Text>
              </View>
              <View>
                <Text style={styles.featuredName}>Platinum Parking Hub</Text>
                <Text style={styles.featuredAddress}>Arera Colony, Bhopal</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Categories / Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionItem} onPress={() => router.push("/wallet")}>
            <View style={[styles.actionIcon, { backgroundColor: "#dbeafe" }]}>
              <Ionicons name="flash" size={24} color="#3b82f6" />
            </View>
            <Text style={styles.actionText}>Fast Exit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={() => router.push("/vehicles")}>
            <View style={[styles.actionIcon, { backgroundColor: "#fef3c7" }]}>
              <Ionicons name="car" size={24} color="#d97706" />
            </View>
            <Text style={styles.actionText}>Vehicles</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={() => router.push("/history")}>
            <View style={[styles.actionIcon, { backgroundColor: "#dcfce7" }]}>
              <Ionicons name="receipt" size={24} color="#16a34a" />
            </View>
            <Text style={styles.actionText}>History</Text>
          </TouchableOpacity>
        </View>

        {/* Nearby List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearest to you</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/map")}><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
          </View>

          {parkings.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.parkingCard}
              onPress={() => router.push(`/parking/${item.id}`)}
            >
              <Image source={{ uri: item.image }} style={styles.cardImage} />
              <View style={styles.cardInfo}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                  <View style={styles.ratingBox}>
                    <Ionicons name="star" size={12} color="#fbbf24" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                  </View>
                </View>
                <Text style={styles.cardPrice}>{item.price}</Text>
                <View style={styles.availabilityRow}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${(item.availableSlots/item.totalSlots)*100}%` }]} />
                  </View>
                  <Text style={styles.slotsText}>{item.availableSlots}/{item.totalSlots} available</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 20
  },
  greeting: { fontSize: width > 400 ? 28 : 24, fontWeight: "bold", color: "#1e293b" },
  locationLabel: { fontSize: 14, color: "#3b82f6", marginTop: 4, fontWeight: "600" },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  profileBtn: { elevation: 4, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    marginHorizontal: 24,
    padding: 15,
    borderRadius: 20,
    marginBottom: 24
  },
  searchText: { marginLeft: 12, color: "#94a3b8", fontSize: 16 },
  section: { paddingHorizontal: 24, marginBottom: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sectionTitle: { fontSize: width > 400 ? 22 : 18, fontWeight: "bold", color: "#1e293b" },
  seeAll: { color: "#3b82f6", fontWeight: "600", fontSize: 14 },
  featuredCard: {
    height: width * 0.5,
    borderRadius: 25,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    marginTop: 12
  },
  featuredImage: { width: "100%", height: "100%" },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: width * 0.05,
    justifyContent: "space-between"
  },
  glassBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)"
  },
  badgeText: { color: "white", fontWeight: "bold", fontSize: 11 },
  featuredName: { color: "white", fontSize: width > 400 ? 24 : 20, fontWeight: "bold" },
  featuredAddress: { color: "rgba(255,255,255,0.8)", fontSize: 13 },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 24
  },
  actionItem: { alignItems: "center", width: (width - 60) / 3 },
  actionIcon: { width: 55, height: 55, borderRadius: 18, justifyContent: "center", alignItems: "center", marginBottom: 6 },
  actionText: { fontSize: 12, fontWeight: "600", color: "#475569" },
  parkingCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 10,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#f1f5f9"
  },
  cardImage: { width: 80, height: 80, borderRadius: 15 },
  cardInfo: { flex: 1, marginLeft: 12, justifyContent: "center" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardName: { fontSize: 16, fontWeight: "bold", color: "#1e293b", flex: 1 },
  ratingBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#fffbeb", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  ratingText: { marginLeft: 4, fontSize: 12, fontWeight: "bold", color: "#d97706" },
  cardPrice: { fontSize: 14, color: "#3b82f6", fontWeight: "600", marginTop: 4 },
  availabilityRow: { marginTop: 10 },
  progressBar: { height: 6, backgroundColor: "#f1f5f9", borderRadius: 3, overflow: "hidden", marginBottom: 4 },
  progressFill: { height: "100%", backgroundColor: "#3b82f6", borderRadius: 3 },
  slotsText: { fontSize: 11, color: "#64748b", fontWeight: "600" }
});
