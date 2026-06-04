import React, { useRef } from 'react';
import {
  View,
  Animated,
  PanResponder,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { height } = Dimensions.get('window');

const COLLAPSED_HEIGHT = height * 0.45;
const EXPANDED_HEIGHT = height * 0.85;

interface BottomDrawerProps {
  children: React.ReactNode;
}

export default function BottomDrawer({ children }: BottomDrawerProps) {
  const { colors } = useTheme();
  
  const drawerHeight = useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;
  const lastHeight = useRef(COLLAPSED_HEIGHT);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: () => {
        drawerHeight.setOffset(lastHeight.current);
        drawerHeight.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        let newHeight = lastHeight.current - gestureState.dy;
        if (newHeight > EXPANDED_HEIGHT) newHeight = EXPANDED_HEIGHT + (newHeight - EXPANDED_HEIGHT) * 0.1;
        if (newHeight < COLLAPSED_HEIGHT) newHeight = COLLAPSED_HEIGHT - (COLLAPSED_HEIGHT - newHeight) * 0.1;
        drawerHeight.setValue(newHeight - lastHeight.current);
      },
      onPanResponderRelease: (_, gestureState) => {
        drawerHeight.flattenOffset();
        
        // internal _value workaround for standard Animated.Value without listeners
        const currentHeight = lastHeight.current - gestureState.dy; 
        const velocity = -gestureState.vy; 

        let targetHeight = COLLAPSED_HEIGHT;
        if (velocity > 0.5 || currentHeight > (COLLAPSED_HEIGHT + EXPANDED_HEIGHT) / 2) {
          targetHeight = EXPANDED_HEIGHT;
        }

        Animated.spring(drawerHeight, {
          toValue: targetHeight,
          useNativeDriver: false,
          bounciness: 0,
        }).start(() => {
          lastHeight.current = targetHeight;
        });
      },
    })
  ).current;

  return (
    <Animated.View 
      style={[
        styles.drawer, 
        { height: drawerHeight, backgroundColor: colors.background, borderColor: colors.border }
      ]}
    >
      <View {...panResponder.panHandlers} style={styles.handleArea}>
        <View style={styles.handle} />
      </View>
      <View style={styles.content}>
        {children}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 20,
  },
  handleArea: {
    width: '100%',
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  handle: {
    width: 50,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#cbd5e1',
  },
  content: {
    flex: 1,
  }
});
