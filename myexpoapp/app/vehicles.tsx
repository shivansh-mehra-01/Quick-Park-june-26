import React, { useState, useEffect } from "react";
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  SafeAreaView, Platform, StatusBar, Modal, TextInput, 
  KeyboardAvoidingView, Alert, ActivityIndicator 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { authService } from "../services/authService";
import { useTheme } from "../context/ThemeContext";

const statusBarHeight = StatusBar.currentHeight || (Platform.OS === "ios" ? 44 : 20);

export default function VehiclesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  
  // Modal State
  const [isModalVisible, setModalVisible] = useState(false);
  const [newPlate, setNewPlate] = useState("");
  const [newType, setNewType] = useState("Car");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const user = await authService.getCurrentUser();
        if (user) {
          setUserId(user.id);
          
          // Legacy support: users created via backend /signup have vehicles as array of strings
          const normalizedVehicles = (user.vehicles || []).map((v: any, index: number) => {
            if (typeof v === "string") {
              return {
                id: `legacy-${index}-${Date.now()}`,
                plate: v,
                type: "Car",
                default: index === 0
              };
            }
            return v;
          });
          
          setVehicles(normalizedVehicles);
        }
    } catch (error) {
      console.error("Error loading vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async () => {
    if (!newPlate.trim()) {
      Alert.alert("Validation Error", "Please enter a license plate number.");
      return;
    }

    setIsSaving(true);
    try {
      const newVehicle = {
        id: Date.now().toString(),
        plate: newPlate.trim().toUpperCase(),
        type: newType,
        default: vehicles.length === 0 // First vehicle is default
      };

      const updatedVehicles = [...vehicles, newVehicle];
      await authService.updateProfile(userId, { vehicles: updatedVehicles });
      
      setVehicles(updatedVehicles);
      setModalVisible(false);
      setNewPlate("");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add vehicle.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (vehicles.length <= 1) {
      Alert.alert("Action Denied", "You must have at least one vehicle registered.");
      return;
    }

    Alert.alert(
      "Delete Vehicle",
      "Are you sure you want to remove this vehicle?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              let updatedVehicles = vehicles.filter(v => v.id !== id);
              // If we deleted the default, make the first one default (if exists)
              if (vehicles.find(v => v.id === id)?.default && updatedVehicles.length > 0) {
                updatedVehicles[0].default = true;
              }
              await authService.updateProfile(userId, { vehicles: updatedVehicles });
              setVehicles(updatedVehicles);
            } catch (error) {
              Alert.alert("Error", "Failed to delete vehicle.");
            }
          }
        }
      ]
    );
  };

  const handleMakeDefault = async (id: string) => {
    try {
      const updatedVehicles = vehicles.map(v => ({
        ...v,
        default: v.id === id
      }));
      await authService.updateProfile(userId, { vehicles: updatedVehicles });
      setVehicles(updatedVehicles);
    } catch (error) {
      Alert.alert("Error", "Failed to update default vehicle.");
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.cardLeft}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + "15" }]}>
          <Ionicons name={item.type === "Car" ? "car-sport-outline" : "bicycle-outline"} size={28} color={colors.primary} />
        </View>
        <View>
          <Text style={[styles.plate, { color: colors.text }]}>{item.plate}</Text>
          <Text style={[styles.type, { color: colors.textSecondary }]}>{item.type}</Text>
        </View>
      </View>
      
      <View style={styles.cardActions}>
        {item.default ? (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Default</Text>
          </View>
        ) : (
          <TouchableOpacity onPress={() => handleMakeDefault(item.id)} style={styles.actionBtn}>
            <Text style={[styles.actionText, { color: colors.primary }]}>Make Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: Platform.OS === "android" ? statusBarHeight + 10 : 10, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Vehicles</Text>
        <View style={{ width: 24 }} />
      </View>

      {vehicles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="car-sport-outline" size={80} color="#cbd5e1" />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Vehicles Yet</Text>
          <Text style={styles.emptySubtitle}>Add your first vehicle to get started with Quick Park.</Text>
        </View>
      ) : (
        <FlatList
          data={vehicles}
          renderItem={renderItem}
          keyExtractor={(item) => item.id || item.plate}
          contentContainerStyle={styles.list}
        />
      )}

      <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.addBtnText}>Add New Vehicle</Text>
      </TouchableOpacity>

      {/* Add Vehicle Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Vehicle</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.typeSelector}>
              <TouchableOpacity 
                style={[styles.typeBtn, newType === "Car" && { backgroundColor: colors.primary }, newType !== "Car" && { backgroundColor: colors.background }]}
                onPress={() => setNewType("Car")}
              >
                <Ionicons name="car-sport" size={24} color={newType === "Car" ? "white" : colors.textSecondary} />
                <Text style={[styles.typeText, newType === "Car" ? { color: "white" } : { color: colors.textSecondary }]}>Car</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.typeBtn, newType === "Bike" && { backgroundColor: colors.primary }, newType !== "Bike" && { backgroundColor: colors.background }]}
                onPress={() => setNewType("Bike")}
              >
                <Ionicons name="bicycle" size={24} color={newType === "Bike" ? "white" : colors.textSecondary} />
                <Text style={[styles.typeText, newType === "Bike" ? { color: "white" } : { color: colors.textSecondary }]}>Bike</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>License Plate Number</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                value={newPlate}
                onChangeText={setNewPlate}
                placeholder="e.g. MH04 AB 1234"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="characters"
              />
            </View>

            <TouchableOpacity 
              style={[styles.saveBtn, { backgroundColor: colors.primary }, isSaving && styles.saveBtnDisabled]} 
              onPress={handleAddVehicle}
              disabled={isSaving}
            >
              {isSaving ? <ActivityIndicator color="white" /> : <Text style={styles.saveBtnText}>Save Vehicle</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9"
  },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#1e293b" },
  list: { padding: 24 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }
  },
  cardLeft: { flexDirection: "row", alignItems: "center" },
  iconContainer: { backgroundColor: "#eff6ff", padding: 14, borderRadius: 16, marginRight: 16 },
  plate: { fontSize: 18, fontWeight: "bold", color: "#1e293b" },
  type: { fontSize: 14, color: "#64748b", marginTop: 4 },
  cardActions: { alignItems: "flex-end", gap: 10 },
  defaultBadge: { backgroundColor: "#dcfce7", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  defaultText: { color: "#16a34a", fontSize: 12, fontWeight: "bold" },
  actionBtn: { paddingHorizontal: 10, paddingVertical: 5 },
  actionText: { color: "#3b82f6", fontSize: 13, fontWeight: "600" },
  deleteBtn: { padding: 5 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  emptyTitle: { fontSize: 22, fontWeight: "bold", color: "#1e293b", marginTop: 20, marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: "#64748b", textAlign: "center", lineHeight: 22 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f6",
    margin: 20,
    padding: 18,
    borderRadius: 20,
    gap: 8,
    shadowColor: "#3b82f6",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  addBtnText: { color: "white", fontSize: 18, fontWeight: "bold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "white", borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30, paddingBottom: 50 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 30 },
  modalTitle: { fontSize: 22, fontWeight: "bold", color: "#1e293b" },
  typeSelector: { flexDirection: "row", gap: 15, marginBottom: 25 },
  typeBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 15, borderRadius: 16, backgroundColor: "#f1f5f9", gap: 10 },
  typeBtnActive: { backgroundColor: "#3b82f6" },
  typeText: { fontSize: 16, fontWeight: "600", color: "#64748b" },
  typeTextActive: { color: "white" },
  formGroup: { marginBottom: 25 },
  inputLabel: { fontSize: 14, fontWeight: "600", color: "#64748b", marginBottom: 8 },
  input: { backgroundColor: "#f1f5f9", padding: 18, borderRadius: 16, fontSize: 16, color: "#1e293b", fontWeight: "bold" },
  saveBtn: { backgroundColor: "#3b82f6", padding: 18, borderRadius: 20, alignItems: "center", marginTop: 10 },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: "white", fontWeight: "bold", fontSize: 18 }
});
