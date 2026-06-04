import { View, StyleSheet, Text } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

const MapMarker = Marker as any;
const MapPolyline = Polyline as any;

interface ParkingMapProps {
  location: { latitude: number; longitude: number };
  parkings: any[];
  routeCoords: any[];
  onMarkerPress?: (parking: any) => void;
  mapRef?: any;
}

export default function ParkingMap({ location, parkings, routeCoords, onMarkerPress, mapRef }: ParkingMapProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.mapContainer}>
      <View style={styles.mapInner}>
        <MapView
          ref={mapRef}
          style={styles.map}
          showsUserLocation={true}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01
          }}
        >
          {parkings.map((p, index) => (
            <MapMarker
              key={p.id || index}
              coordinate={{
                latitude: p.lat,
                longitude: p.lon
              }}
              onPress={() => onMarkerPress && onMarkerPress(p)}
            >
              <View style={[styles.customMarker, { backgroundColor: colors.primary }]}>
                <Ionicons name="car" size={12} color="white" />
              </View>
            </MapMarker>
          ))}

          {routeCoords.length > 0 && (
            <MapPolyline
              coordinates={routeCoords}
              strokeWidth={5}
              strokeColor="blue"
            />
          )}

        </MapView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  mapInner: {
    flex: 1,
    borderRadius: 15,
    overflow: "hidden"
  },
  map: {
    flex: 1
  },
  customMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  }
});