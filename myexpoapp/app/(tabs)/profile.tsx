import React from "react";
import { 
  View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, 
  SafeAreaView, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform, StatusBar, Alert 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { fetchUserHistoryApi, fetchProfileApi, updateProfileApi } from "../../services/parkingService";

const statusBarHeight = StatusBar.currentHeight || (Platform.OS === "ios" ? 44 : 20);

export default function ProfileTab() {
  const router = useRouter();
  const [history, setHistory] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  const [userName, setUserName] = React.useState("");
  const [userEmail, setUserEmail] = React.useState("abhishek@smartparking.com");
  const [wallet, setWallet] = React.useState(0);
  const [isEditModalVisible, setEditModalVisible] = React.useState(false);
  const [tempName, setTempName] = React.useState("");
  const [tempEmail, setTempEmail] = React.useState("");

  React.useEffect(() => {
    async function loadProfile() {
      try {
        const [historyData, profileData] = await Promise.all([
          fetchUserHistoryApi(),
          fetchProfileApi(userEmail)
        ]);
        setHistory(historyData);
        setUserName(profileData.full_name || "New User");
        setWallet(profileData.wallet_balance || 0);
      } catch (error) {
        console.log("Profile load error:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSaveProfile = async () => {
    const success = await updateProfileApi({ email: tempEmail, full_name: tempName });
    if (success) {
      setUserName(tempName);
      setUserEmail(tempEmail);
      setEditModalVisible(false);
    }
  };

  const totalSpent = history.reduce((acc, curr) => {
    const cost = parseInt(curr.cost.replace("₹", "")) || 0;
    return acc + cost;
  }, 0);

  const menuItems = [
    { icon: "time-outline", label: "Parking History", route: "/history", color: "#3b82f6" },
    { icon: "car-outline", label: "My Vehicles", route: "/vehicles", color: "#16a34a" },
    { icon: "wallet-outline", label: "Payments & Wallet", route: "/wallet", color: "#d97706" },
    { icon: "settings-outline", label: "Settings", route: "/settings", color: "#64748b" },
  ];

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={[styles.content, { paddingTop: Platform.OS === "android" ? statusBarHeight + 20 : 20 }]} 
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: `https://ui-avatars.com/api/?name=${userName}&background=3b82f6&color=fff&size=128` }} 
              style={styles.avatar} 
            />
            <TouchableOpacity 
              style={styles.editBtn}
              onPress={() => {
                setTempName(userName);
                setTempEmail(userEmail);
                setEditModalVisible(true);
              }}
            >
              <Ionicons name="pencil" size={18} color="white" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => setEditModalVisible(true)}>
            <Text style={styles.userName}>{userName} <Ionicons name="chevron-forward" size={16} color="#cbd5e1" /></Text>
          </TouchableOpacity>
          <Text style={styles.userEmail}>{userEmail}</Text>
        </View>

        {/* Dynamic Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{history.length}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>₹{wallet}</Text>
            <Text style={styles.statLabel}>Wallet</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>4.9</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.menuItem}
              onPress={() => item.route && router.push(item.route)}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.iconContainer, { backgroundColor: item.color + "15" }]}>
                  <Ionicons name={item.icon as any} size={22} color={item.color} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.logoutBtn}
          onPress={() => {
            Alert.alert(
              "Log Out",
              "Are you sure you want to log out?",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Log Out", style: "destructive", onPress: () => router.replace("/") }
              ]
            );
          }}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput 
                style={styles.input}
                value={tempName}
                onChangeText={setTempName}
                placeholder="Enter your name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput 
                style={styles.input}
                value={tempEmail}
                onChangeText={setTempEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
              />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 24 },
  profileHeader: { alignItems: "center", marginBottom: 32 },
  avatarContainer: { position: "relative", marginBottom: 16 },
  avatar: { width: 110, height: 110, borderRadius: 55, borderWidth: 4, borderColor: "white" },
  editBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#3b82f6",
    padding: 10,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#f8fafc"
  },
  userName: { fontSize: 24, fontWeight: "bold", color: "#1e293b" },
  userEmail: { fontSize: 14, color: "#64748b", marginTop: 4 },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 15,
  },
  statBox: { flex: 1, alignItems: "center" },
  statNumber: { fontSize: 20, fontWeight: "bold", color: "#1e293b" },
  statLabel: { fontSize: 12, color: "#64748b", marginTop: 4, fontWeight: "600" },
  statDivider: { width: 1, height: "100%", backgroundColor: "#f1f5f9" },
  menuContainer: { backgroundColor: "white", borderRadius: 24, padding: 8, elevation: 2, shadowColor: "#000", shadowOpacity: 0.05 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  menuLeft: { flexDirection: "row", alignItems: "center" },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16
  },
  menuLabel: { fontSize: 16, fontWeight: "600", color: "#334155" },
  logoutBtn: {
    marginTop: 32,
    backgroundColor: "#fff1f2",
    padding: 18,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10
  },
  logoutText: { color: "#ef4444", fontWeight: "bold", fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "white", borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30, paddingBottom: 50 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 30 },
  modalTitle: { fontSize: 22, fontWeight: "bold", color: "#1e293b" },
  formGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: "600", color: "#64748b", marginBottom: 8 },
  input: { backgroundColor: "#f1f5f9", padding: 15, borderRadius: 15, fontSize: 16, color: "#1e293b" },
  saveBtn: { backgroundColor: "#3b82f6", padding: 18, borderRadius: 20, alignItems: "center", marginTop: 10 },
  saveBtnText: { color: "white", fontWeight: "bold", fontSize: 16 }
});
