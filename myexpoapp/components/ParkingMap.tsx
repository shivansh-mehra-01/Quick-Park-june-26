import { View, StyleSheet } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

const MapMarker = Marker as any;
const MapPolyline = Polyline as any;

interface ParkingMapProps {
  location: { latitude: number; longitude: number };
  parkings: any[];
  routeCoords: any[];
}

export default function ParkingMap({ location, parkings, routeCoords }: ParkingMapProps) {
  return (
    <View style={styles.mapContainer}>
      <View style={styles.mapInner}>
        <MapView
          style={styles.map}
          region={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01
          }}
        >
          <MapMarker
            coordinate={location}
            title="You are here"
            pinColor="blue"
          />

          {parkings.map((p, index) => (
            <MapMarker
              key={index}
              coordinate={{
                latitude: p.lat,
                longitude: p.lon
              }}
              title={p.tags?.name || "Parking"}
              pinColor="green"
            />
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
  }
});