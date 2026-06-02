import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface ParkingMapProps {
  location: { latitude: number; longitude: number };
  parkings: any[];
  routeCoords: any[];
}

export default function ParkingMap({ location, parkings }: ParkingMapProps) {
  return (
    <View style={styles.mapContainer}>
      <View style={styles.mapInner}>
        <Text style={styles.text}>
          Interactive Map is not supported on Web.
          Please use the Expo Go app on your Android/iOS device to see the Map.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  mapInner: {
    flex: 1,
    borderRadius: 15,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  text: {
    textAlign: "center",
    fontSize: 16,
    color: "#555",
  },
});
