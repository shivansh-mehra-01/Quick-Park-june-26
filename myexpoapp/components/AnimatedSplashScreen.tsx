import { View, StyleSheet, Text, Animated } from "react-native";
import { useEffect, useRef, useState } from "react";

export default function AnimatedSplashScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Start map logo spring animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();

    // After 2.5 seconds, fade out the splash screen nicely
    const timeout = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setShowSplash(false);
      });
    }, 2500);

    return () => clearTimeout(timeout);
  }, []);

  if (!showSplash) return null;

  return (
    <Animated.View style={[styles.splashContainer, { opacity: fadeAnim }]}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }], alignItems: "center" }}>
        
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>P</Text>
        </View>
        
        <Text style={styles.splashTitle}>Smart Parking</Text>
        <Text style={styles.splashSubtitle}>Find your spot with ease.</Text>
        
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#3b653db8", // Smooth muted green
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000, 
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  logoText: {
    fontSize: 50,
    fontWeight: "bold",
    color: "#325e35c3",
  },
  splashTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    letterSpacing: 1,
  },
  splashSubtitle: {
    fontSize: 16,
    color: "#C8E6C9",
    opacity: 0.9,
  }
});
