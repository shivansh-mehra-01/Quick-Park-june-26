import { FlatList, TouchableOpacity, Text, StyleSheet, View } from "react-native";
import React from "react";
import { getDistance } from "../utils/locationUtils";

interface ParkingListProps {
  location: { latitude: number; longitude: number };
  parkings: any[];
  onSelectParking: (parking: any) => void;
  ListHeaderComponent?: React.ReactElement;
}

export default function ParkingList({ location, parkings, onSelectParking, ListHeaderComponent }: ParkingListProps) {
  return (
    <FlatList
      ListHeaderComponent={ListHeaderComponent}
      data={[...parkings].sort((a, b) => {
        const distA = getDistance(location.latitude, location.longitude, a.lat, a.lon);
        const distB = getDistance(location.latitude, location.longitude, b.lat, b.lon);
        return distA - distB;
      })}
      keyExtractor={(item: any, index: number) => index.toString()}
      renderItem={({ item }: { item: any }) => {
        const dist = getDistance(location.latitude, location.longitude, item.lat, item.lon);
        return (
          <TouchableOpacity
            style={styles.item}
            onPress={() => onSelectParking(item)}
          >
            <View style={styles.infoContainer}>
              <Text style={styles.name}>
                {item.tags?.name || "Parking"}
              </Text>
              <Text style={styles.coords}>
                Distance: {dist} km away
              </Text>
            </View>
            <View style={styles.slotsContainer}>
              <Text style={styles.slotsText}>
                {item.availableSlots !== undefined && item.totalSlots !== undefined
                  ? `${item.availableSlots} / ${item.totalSlots}`
                  : item.tags?.capacity
                    ? `xx / ${item.tags.capacity}`
                    : "xx / xx"}
              </Text>
              <Text style={styles.slotsLabel}>Available Slots</Text>
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    marginHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderColor: "black",
    borderWidth: 0.2,
  },
  infoContainer: {
    flex: 1,
    paddingRight: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: "600"
  },
  coords: {
    fontSize: 15,
    color: "#666",
    marginTop: 3
  },
  slotsContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  slotsText: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#2e7d32",
  },
  slotsLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  }
});