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
import { authService } from "../../services/authService";
import { useTheme } from "../../context/ThemeContext";

const { width, height } = Dimensions.get("window");
const statusBarHeight = StatusBar.currentHeight || (Platform.OS === "ios" ? 44 : 20);

function ParkingDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  
  const [parking, setParking] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchNearbyParkingApi(0, 0);
        const found = data.find((p: any) => p.id === id) || data[0];
        setParking(found);

        const user = await authService.getCurrentUser();
        if (user) {
          setUserId(user.id);
          setFavorites(user.favorites || []);
          setIsFavorite((user.favorites || []).includes(found.id));
        }
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

  const toggleFavorite = async () => {
    if (!userId || !parking) return;
    
    let updatedFavorites;
    if (isFavorite) {
      updatedFavorites = favorites.filter(favId => favId !== parking.id);
    } else {
      updatedFavorites = [...favorites, parking.id];
    }
    
    setIsFavorite(!isFavorite);
    setFavorites(updatedFavorites);
    
    try {
      await authService.updateProfile(userId, { favorites: updatedFavorites });
    } catch (error) {
      console.log("Failed to update favorite", error);
      // Revert if failed
      setIsFavorite(isFavorite);
      setFavorites(favorites);
    }
  };

  if (!parking) {
    return (
      <View style={styles.loading}>
        <Text>Loading details...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Top Image & Back Button */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: parking.image }} style={styles.headerImage} />
          <TouchableOpacity 
            style={[styles.backBtn, { top: statusBarHeight + 15, backgroundColor: colors.card }]} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.heartBtn, { top: statusBarHeight + 15, backgroundColor: colors.card }]}
            onPress={toggleFavorite}
          >
            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={24} color={isFavorite ? "#ef4444" : "black"} />
          </TouchableOpacity>
        </View>

        <View style={[styles.content, { backgroundColor: colors.background }]}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: colors.text }]}>{parking.name}</Text>
            <View style={[styles.ratingBox, { backgroundColor: colors.warning + "20" }]}>
              <Ionicons name="star" size={16} color={colors.warning} />
              <Text style={[styles.ratingText, { color: colors.warning }]}>{parking.rating}</Text>
            </View>
          </View>

          {/* Features Row */}
          <View style={styles.featuresRow}>
            <View style={[styles.feature, { backgroundColor: colors.card }]}>
              <Ionicons name="car-outline" size={24} color={colors.primary} />
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>{parking.totalSlots} Slots</Text>
            </View>
            <View style={[styles.feature, { backgroundColor: colors.card }]}>
              <Ionicons name="videocam-outline" size={24} color={colors.primary} />
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>CCTV</Text>
            </View>
            <View style={[styles.feature, { backgroundColor: colors.card }]}>
              <Ionicons name="shield-checkmark-outline" size={24} color={colors.primary} />
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>Guarded</Text>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>About Parking</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            This premium parking facility offers automated entry/exit with AI-powered License Plate Recognition. 
            Enjoy hassle-free parking with real-time slot availability and secure surveillance.
          </Text>

          {/* Action Buttons */}
          <View style={styles.navButtonsRow}>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push({ pathname: "/(tabs)/map", params: { navigateTo: parking.id } })}
            >
              <Ionicons name="navigate" size={20} color="white" />
              <Text style={styles.actionBtnText}>In-App Route</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: '#4285F4' }]}
              onPress={openInGoogleMaps}
            >
              <Ionicons name="map" size={20} color="white" />
              <Text style={styles.actionBtnText}>Google Maps</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
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

  navButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 24
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 20,
    gap: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  actionBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold"
  }
});

export default ParkingDetail;
