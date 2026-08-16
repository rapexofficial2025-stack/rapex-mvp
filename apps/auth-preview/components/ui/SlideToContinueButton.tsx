import { useRef, useState } from "react";
import { Animated, LayoutChangeEvent, PanResponder, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronRight } from "lucide-react-native";

type Props = {
  label: string;
  onComplete: () => void;
};

const THUMB_SIZE = 52;
const TRACK_PADDING = 4;
const COMPLETE_THRESHOLD = 0.82;

/** Real drag-to-confirm slider (not just a styled tap button) -- built on
 * core RN PanResponder, no extra gesture library needed. */
export function SlideToContinueButton({ label, onComplete }: Props) {
  const [trackWidth, setTrackWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const completed = useRef(false);
  const maxTranslate = Math.max(trackWidth - THUMB_SIZE - TRACK_PADDING * 2, 1);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_evt, gesture) => {
        if (completed.current) return;
        const next = Math.min(Math.max(gesture.dx, 0), maxTranslate);
        translateX.setValue(next);
      },
      onPanResponderRelease: (_evt, gesture) => {
        if (completed.current) return;
        const next = Math.min(Math.max(gesture.dx, 0), maxTranslate);
        if (next >= maxTranslate * COMPLETE_THRESHOLD) {
          completed.current = true;
          Animated.timing(translateX, { toValue: maxTranslate, duration: 150, useNativeDriver: true }).start(() => {
            onComplete();
          });
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  function handleLayout(e: LayoutChangeEvent) {
    setTrackWidth(e.nativeEvent.layout.width);
  }

  return (
    <View style={styles.track} onLayout={handleLayout}>
      <LinearGradient
        colors={["#FF7A00", "#B100FF"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      <Text style={styles.label} pointerEvents="none">
        {label}
      </Text>
      <Animated.View style={[styles.thumb, { transform: [{ translateX }] }]} {...panResponder.panHandlers}>
        <ChevronRight color="#7B3FF2" size={26} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    overflow: "hidden",
    paddingHorizontal: TRACK_PADDING,
  },
  label: { color: "#FFFFFF", fontSize: 17, fontWeight: "800", textAlign: "center" },
  thumb: {
    position: "absolute",
    left: TRACK_PADDING,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
});
