import React from "react";
import { 
  View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, 
  SafeAreaView, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform, StatusBar, Alert 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { fetchUserHistoryApi } from "../../services/parkingService";
import { authService } from "../../services/authService";
import { useTheme } from "../../context/ThemeContext";

const statusBarHeight = StatusBar.currentHeight || (Platform.OS === "ios" ? 44 : 20);

export default function ProfileTab() {
  const router = useRouter();
  const { colors } = useTheme();
  const [history, setHistory] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  const [userId, setUserId] = React.useState("");
  const [userName, setUserName] = React.useState("");
  const [userEmail, setUserEmail] = React.useState("");
  const [isEditModalVisible, setEditModalVisible] = React.useState(false);
  const [tempName, setTempName] = React.useState("");
  const [tempEmail, setTempEmail] = React.useState("");

  React.useEffect(() => {
    async function loadProfile() {
      try {
        const [historyData, currentUser] = await Promise.all([
          fetchUserHistoryApi(),
          authService.getCurrentUser()
        ]);
        setHistory(historyData);
        if (currentUser) {
          setUserId(currentUser.id);
          setUserName(currentUser.name || "New User");
          setUserEmail(currentUser.email || "");
        }
      } catch (error) {
        console.log("Profile load error:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSaveProfile = async () => {
    if (!tempName.trim() || !tempEmail.trim()) {
      Alert.alert("Validation Error", "Name and Email cannot be empty.");
      return;
    }

    try {
      if (userId) {
        await authService.updateProfile(userId, { name: tempName.trim(), email: tempEmail.trim().toLowerCase() });
      }
      setUserName(tempName.trim());
      setUserEmail(tempEmail.trim().toLowerCase());
      setEditModalVisible(false);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update profile.");
    }
  };


  const menuItems = [
    { icon: "time-outline", label: "Parking History", route: "/history", color: colors.primary },
    { icon: "car-outline", label: "My Vehicles", route: "/vehicles", color: colors.success },
    { icon: "settings-outline", label: "Settings", route: "/settings", color: colors.textSecondary },
  ];

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={[styles.content, { paddingTop: Platform.OS === "android" ? statusBarHeight + 20 : 20 }]} 
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: `https://ui-avatars.com/api/?name=${userName}&background=3b82f6&color=fff&size=128` }} 
              style={[styles.avatar, { borderColor: colors.card }]} 
            />
            <TouchableOpacity 
              style={[styles.editBtn, { backgroundColor: colors.primary, borderColor: colors.background }]}
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
            <Text style={[styles.userName, { color: colors.text }]}>{userName} <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} /></Text>
          </TouchableOpacity>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{userEmail}</Text>
        </View>

        {/* Menu Items */}
        <View style={[styles.menuContainer, { backgroundColor: colors.card }]}>
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
                <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.logoutBtn, { backgroundColor: colors.danger + "10" }]}
          onPress={() => {
            Alert.alert(
              "Log Out",
              "Are you sure you want to log out?",
              [
                { text: "Cancel", style: "cancel" },
                { 
                  text: "Log Out", 
                  style: "destructive", 
                  onPress: async () => {
                    await authService.logout();
                    router.replace("/login");
                  } 
                }
              ]
            );
          }}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>Log Out</Text>
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
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Full Name</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                value={tempName}
                onChangeText={setTempName}
                placeholder="Enter your name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email Address</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                value={tempEmail}
                onChangeText={setTempEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSaveProfile}>
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
  container: { flex: 1 },
  content: { padding: 24 },
  profileHeader: { alignItems: "center", marginBottom: 32 },
  avatarContainer: { position: "relative", marginBottom: 16 },
  avatar: { width: 110, height: 110, borderRadius: 55, borderWidth: 4 },
  editBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    padding: 10,
    borderRadius: 20,
    borderWidth: 3,
  },
  userName: { fontSize: 24, fontWeight: "bold" },
  userEmail: { fontSize: 14, marginTop: 4 },
  statsRow: {
    flexDirection: "row",
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 15,
  },
  statBox: { flex: 1, alignItems: "center" },
  statNumber: { fontSize: 20, fontWeight: "bold" },
  statLabel: { fontSize: 12, marginTop: 4, fontWeight: "600" },
  statDivider: { width: 1, height: "100%" },
  menuContainer: { borderRadius: 24, padding: 8, elevation: 2, shadowColor: "#000", shadowOpacity: 0.05 },
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
  menuLabel: { fontSize: 16, fontWeight: "600" },
  logoutBtn: {
    marginTop: 32,
    padding: 18,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10
  },
  logoutText: { fontWeight: "bold", fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30, paddingBottom: 50 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 30 },
  modalTitle: { fontSize: 22, fontWeight: "bold" },
  formGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  input: { padding: 15, borderRadius: 15, fontSize: 16 },
  saveBtn: { padding: 18, borderRadius: 20, alignItems: "center", marginTop: 10 },
  saveBtnText: { color: "white", fontWeight: "bold", fontSize: 16 }
});
