import React, { useState, useEffect } from "react";
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  Linking, 
  Platform, 
  StatusBar 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fetchNearbyParkingApi } from "../../services/parkingService";

const { width, height } = Dimensions.get("window");
const statusBarHeight = StatusBar.currentHeight || (Platform.OS === "ios" ? 44 : 20);

function ParkingDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [parking, setParking] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchNearbyParkingApi(0, 0);
        const found = data.find((p: any) => p.id === id) || data[0];
        setParking(found);
      } catch (err) {
        console.log("Detail load error:", err);
      }
    }
    load();
  }, [id]);

  const openInGoogleMaps = () => {
    if (!parking) return;
    const scheme = Platform.select({ ios: "maps:0,0?q=", android: "geo:0,0?q=" });
    const latLng = `${parking.lat},${parking.lon}`;
    const label = parking.name;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });

    if (url) Linking.openURL(url);
  };

  if (!parking) {
    return (
      <View style={styles.loading}>
        <Text>Loading details...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Top Image & Back Button */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: parking.image }} style={styles.headerImage} />
          <TouchableOpacity 
            style={[styles.backBtn, { top: statusBarHeight }]} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.heartBtn, { top: statusBarHeight }]}
          >
            <Ionicons name="heart-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.mainInfo}>
            <View>
              <Text style={styles.title}>{parking.name}</Text>
              <Text style={styles.address}>Arera Colony, Bhopal, MP</Text>
            </View>
            <View style={styles.ratingBox}>
              <Ionicons name="star" size={16} color="#fbbf24" />
              <Text style={styles.ratingText}>{parking.rating}</Text>
            </View>
          </View>

          {/* Features Row */}
          <View style={styles.featuresRow}>
            <View style={styles.feature}>
              <Ionicons name="car" size={24} color="#3b82f6" />
              <Text style={styles.featureText}>{parking.totalSlots} Slots</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="shield-checkmark" size={24} color="#16a34a" />
              <Text style={styles.featureText}>Secure</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="time" size={24} color="#d97706" />
              <Text style={styles.featureText}>24/7 Access</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>About Parking</Text>
          <Text style={styles.description}>
            This premium parking facility offers automated entry/exit with AI-powered License Plate Recognition. 
            Enjoy hassle-free parking with real-time slot availability and secure surveillance.
          </Text>

          <View style={styles.pricingCard}>
            <View>
              <Text style={styles.priceLabel}>Parking Price</Text>
              <Text style={styles.priceValue}>{parking.price}<Text style={styles.priceUnit}> / hour</Text></Text>
            </View>
            <View style={styles.availabilityBadge}>
              <Text style={styles.availabilityText}>{parking.availableSlots} Left</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity 
            style={[styles.secondaryBtn, { marginTop: 24 }]}
            onPress={() => router.push("/(tabs)/map")}
          >
            <Ionicons name="map-outline" size={20} color="#3b82f6" />
            <Text style={styles.secondaryBtnText}>Show on Internal Map</Text>
          </TouchableOpacity>
        </View>
        
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky Bottom Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.navBtn} onPress={openInGoogleMaps}>
          <Ionicons name="navigate" size={20} color="white" />
          <Text style={styles.navBtnText}>Get Directions Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, backgroundColor: "#fff" },
  imageContainer: { position: "relative" },
  headerImage: { width: "100%", height: height * 0.35 },
  backBtn: {
    position: "absolute",
    left: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 15,
    elevation: 5,
    zIndex: 10
  },
  heartBtn: {
    position: "absolute",
    right: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 15,
    elevation: 5,
    zIndex: 10
  },
  content: { padding: width * 0.06, marginTop: -30, backgroundColor: "white", borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  mainInfo: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  title: { fontSize: width > 400 ? 28 : 22, fontWeight: "bold", color: "#1e293b" },
  address: { fontSize: 14, color: "#64748b", marginTop: 4 },
  ratingBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#fffbeb", padding: 8, borderRadius: 12 },
  ratingText: { marginLeft: 6, fontWeight: "bold", color: "#d97706" },
  featuresRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 32 },
  feature: { alignItems: "center", backgroundColor: "#f8fafc", padding: width * 0.03, borderRadius: 20, width: (width - (width * 0.2)) / 3 },
  featureText: { marginTop: 8, fontSize: 12, fontWeight: "600", color: "#475569" },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#1e293b", marginBottom: 12 },
  description: { fontSize: 15, color: "#64748b", lineHeight: 24, marginBottom: 32 },
  pricingCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    padding: 24,
    borderRadius: 24
  },
  priceLabel: { fontSize: 14, color: "#64748b", marginBottom: 4 },
  priceValue: { fontSize: 24, fontWeight: "bold", color: "#1e293b" },
  priceUnit: { fontSize: 16, fontWeight: "normal", color: "#64748b" },
  availabilityBadge: { backgroundColor: "#3b82f6", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  availabilityText: { color: "white", fontWeight: "bold" },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9"
  },
  navBtn: {
    backgroundColor: "#1e293b",
    height: 60,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12
  },
  navBtnText: { color: "white", fontSize: 18, fontWeight: "bold" },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eff6ff",
    padding: 18,
    borderRadius: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: "#bfdbfe"
  },
  secondaryBtnText: {
    color: "#3b82f6",
    fontSize: 16,
    fontWeight: "bold"
  }
});

export default ParkingDetail;
