import React, { useState, useEffect } from "react";
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  SafeAreaView, Image, Platform, StatusBar, ActivityIndicator 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { authService } from "../services/authService";
import { fetchNearbyParkingApi } from "../services/parkingService";
import { useTheme } from "../context/ThemeContext";

const statusBarHeight = StatusBar.currentHeight || (Platform.OS === "ios" ? 44 : 20);

export default function FavoritesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [favoriteParkings, setFavoriteParkings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const user = await authService.getCurrentUser();
      const allParkings = await fetchNearbyParkingApi(0, 0); // Get all parkings
      
      if (user && user.favorites && user.favorites.length > 0) {
        const favs = allParkings.filter(p => user.favorites.includes(p.id));
        setFavoriteParkings(favs);
      } else {
        setFavoriteParkings([]);
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (id: string) => {
    try {
      const user = await authService.getCurrentUser();
      if (user && user.favorites) {
        const newFavorites = user.favorites.filter((favId: string) => favId !== id);
        await authService.updateProfile(user.id, { favorites: newFavorites });
        setFavoriteParkings(prev => prev.filter(p => p.id !== id));
      }
    } catch (error) {
      console.log("Error removing favorite", error);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.parkingCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/parking/${item.id}`)}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardInfo}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
          <TouchableOpacity onPress={() => removeFavorite(item.id)}>
            <Ionicons name="heart" size={24} color={colors.danger} />
          </TouchableOpacity>
        </View>
        <View style={[styles.ratingBox, { backgroundColor: colors.warning + "20" }]}>
          <Ionicons name="star" size={12} color={colors.warning} />
          <Text style={[styles.ratingText, { color: colors.warning }]}>{item.rating}</Text>
        </View>
        <View style={styles.availabilityRow}>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${(item.availableSlots/item.totalSlots)*100}%` }]} />
          </View>
          <Text style={[styles.slotsText, { color: colors.textSecondary }]}>{item.availableSlots}/{item.totalSlots} available</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: Platform.OS === "android" ? statusBarHeight + 10 : 10, backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Favorite Parkings</Text>
        <View style={{ width: 24 }} />
      </View>

      {favoriteParkings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-dislike-outline" size={80} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Favorites Yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Tap the heart icon on any parking spot to add it to your favorites.
          </Text>
        </View>
      ) : (
        <FlatList
          data={favoriteParkings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9"
  },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  list: { padding: 24 },
  parkingCard: {
    flexDirection: "row",
    borderRadius: 20,
    padding: 10,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    borderWidth: 1,
  },
  cardImage: { width: 100, height: 100, borderRadius: 15 },
  cardInfo: { flex: 1, marginLeft: 15, justifyContent: "center" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardName: { fontSize: 16, fontWeight: "bold", flex: 1, marginRight: 10 },
  ratingBox: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: "flex-start", marginTop: 6 },
  ratingText: { marginLeft: 4, fontSize: 12, fontWeight: "bold" },
  availabilityRow: { marginTop: 12 },
  progressBar: { height: 6, borderRadius: 3, overflow: "hidden", marginBottom: 4 },
  progressFill: { height: "100%", borderRadius: 3 },
  slotsText: { fontSize: 11, fontWeight: "600" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  emptyTitle: { fontSize: 22, fontWeight: "bold", marginTop: 20, marginBottom: 8 },
  emptySubtitle: { fontSize: 15, textAlign: "center", lineHeight: 22 }
});
