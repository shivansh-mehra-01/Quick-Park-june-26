import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Header() {

    return (
        <SafeAreaView edges={['top']} style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>QuickPark</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({

    container: {
        backgroundColor: "white",
        // We apply shadow here so it casts at the bottom of the entire block
        // zIndex ensures it stays above the Map layout
        zIndex: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 }, // Only casts bottom shadow for iOS
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 6, // Casts bottom shadow on Android
    },

    header: {
        height: 40,
        justifyContent: "center",
        paddingLeft: 30,
        backgroundColor: "white",
    },

    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "black"
    }

});