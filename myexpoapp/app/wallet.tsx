import React from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const statusBarHeight = StatusBar.currentHeight || (Platform.OS === "ios" ? 44 : 20);

export default function WalletScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: Platform.OS === "android" ? statusBarHeight + 10 : 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payments & Wallet</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>₹500.00</Text>
          <TouchableOpacity style={styles.addMoneyBtn}>
            <Ionicons name="add-circle-outline" size={20} color="white" />
            <Text style={styles.addMoneyText}>Add Money</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Payment Methods</Text>
        <View style={styles.paymentMethodCard}>
          <View style={styles.methodLeft}>
            <Ionicons name="card" size={24} color="#3b82f6" />
            <Text style={styles.methodText}>•••• •••• •••• 4242</Text>
          </View>
          <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
        </View>
        <View style={styles.paymentMethodCard}>
          <View style={styles.methodLeft}>
            <Ionicons name="logo-upi" size={24} color="#d97706" />
            <Text style={styles.methodText}>user@upi</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <View style={styles.transactionCard}>
          <View style={styles.transLeft}>
            <View style={[styles.iconBox, { backgroundColor: "#fee2e2" }]}>
              <Ionicons name="arrow-down" size={20} color="#ef4444" />
            </View>
            <View>
              <Text style={styles.transTitle}>Parking Fee</Text>
              <Text style={styles.transDate}>Today, 02:30 PM</Text>
            </View>
          </View>
          <Text style={styles.transAmountNegative}>-₹40</Text>
        </View>
        <View style={styles.transactionCard}>
          <View style={styles.transLeft}>
            <View style={[styles.iconBox, { backgroundColor: "#dcfce7" }]}>
              <Ionicons name="arrow-up" size={20} color="#16a34a" />
            </View>
            <View>
              <Text style={styles.transTitle}>Added Money</Text>
              <Text style={styles.transDate}>Yesterday</Text>
            </View>
          </View>
          <Text style={styles.transAmountPositive}>+₹200</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9"
  },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#1e293b" },
  content: { padding: 20 },
  balanceCard: {
    backgroundColor: "#1e293b",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 30,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10
  },
  balanceLabel: { color: "#94a3b8", fontSize: 16 },
  balanceAmount: { color: "white", fontSize: 40, fontWeight: "bold", marginVertical: 10 },
  addMoneyBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    marginTop: 10
  },
  addMoneyText: { color: "white", fontWeight: "bold", fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1e293b", marginBottom: 15 },
  paymentMethodCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    marginBottom: 10
  },
  methodLeft: { flexDirection: "row", alignItems: "center", gap: 15 },
  methodText: { fontSize: 16, fontWeight: "500", color: "#334155" },
  transactionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    marginBottom: 10
  },
  transLeft: { flexDirection: "row", alignItems: "center", gap: 15 },
  iconBox: { padding: 10, borderRadius: 12 },
  transTitle: { fontSize: 16, fontWeight: "600", color: "#1e293b" },
  transDate: { fontSize: 13, color: "#64748b", marginTop: 4 },
  transAmountNegative: { fontSize: 16, fontWeight: "bold", color: "#ef4444" },
  transAmountPositive: { fontSize: 16, fontWeight: "bold", color: "#16a34a" }
});
