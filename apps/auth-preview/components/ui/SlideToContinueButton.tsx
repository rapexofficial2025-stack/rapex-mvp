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
 * core RN PanResponder, no extra gesture library needed. 3D treatment:
 * a raised glossy thumb (real shadow + inner highlight gradient), an
 * embossed/grooved track (top inner shadow, bottom inner highlight), and
 * a glowing fill trail that grows behind the thumb as it slides right. */
export function SlideToContinueButton({ label, onComplete }: Props) {
  const [trackWidth, setTrackWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const completed = useRef(false);
  const maxTranslate = Math.max(trackWidth - THUMB_SIZE - TRACK_PADDING * 2, 1);
  // PanResponder.create is only called once (useRef), so its handler closures would otherwise
  // permanently capture maxTranslate from the FIRST render -- before onLayout ever fires, when
  // trackWidth is still 0 and maxTranslate is clamped to 1px. That made the "slide 82% across"
  // threshold ~0.8px, trivially satisfied by any tap's natural finger jitter (the real bug behind
  // "you need to press it, not slide"). Keeping the current value in a ref that's updated every
  // render, and reading THAT inside the handlers, fixes it without recreating the PanResponder.
  const maxTranslateRef = useRef(maxTranslate);
  maxTranslateRef.current = maxTranslate;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_evt, gesture) => Math.abs(gesture.dx) > 2,
      onPanResponderMove: (_evt, gesture) => {
        if (completed.current) return;
        const next = Math.min(Math.max(gesture.dx, 0), maxTranslateRef.current);
        translateX.setValue(next);
      },
      onPanResponderRelease: (_evt, gesture) => {
        if (completed.current) return;
        const next = Math.min(Math.max(gesture.dx, 0), maxTranslateRef.current);
        if (next >= maxTranslateRef.current * COMPLETE_THRESHOLD) {
          completed.current = true;
          Animated.timing(translateX, { toValue: maxTranslateRef.current, duration: 150, useNativeDriver: true }).start(() => {
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

  // Fill trail grows with the thumb -- width can't use the native driver, so this one small
  // animated style stays on the JS thread while translateX (transform) stays native-driven.
  const fillWidth = Animated.add(translateX, THUMB_SIZE / 2 + TRACK_PADDING);

  return (
    <View style={styles.track} onLayout={handleLayout}>
      <LinearGradient colors={["#FF7A00", "#B100FF"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />

      {/* Embossed groove: darker top inner edge, lighter bottom inner edge. */}
      <View pointerEvents="none" style={styles.grooveTop} />
      <View pointerEvents="none" style={styles.grooveBottom} />

      {/* Glowing fill trail behind the thumb, grows as it slides right. */}
      <Animated.View pointerEvents="none" style={[styles.fillTrail, { width: fillWidth }]}>
        <LinearGradient colors={["rgba(255,255,255,0.55)", "rgba(255,255,255,0.05)"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
      </Animated.View>

      <Text style={styles.label} pointerEvents="none">
        {label}
      </Text>

      <Animated.View style={[styles.thumb, { transform: [{ translateX }] }]} {...panResponder.panHandlers}>
        <LinearGradient
          colors={["#FFFFFF", "#E8E4F5"]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View pointerEvents="none" style={styles.thumbHighlight} />
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
  grooveTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(0,0,0,0.22)",
  },
  grooveBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  fillTrail: {
    position: "absolute",
    left: 0,
    top: TRACK_PADDING,
    bottom: TRACK_PADDING,
    borderRadius: 26,
    overflow: "hidden",
  },
  label: { color: "#FFFFFF", fontSize: 17, fontWeight: "800", textAlign: "center" },
  thumb: {
    position: "absolute",
    left: TRACK_PADDING,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
  thumbHighlight: {
    position: "absolute",
    top: 3,
    left: 8,
    width: THUMB_SIZE * 0.45,
    height: THUMB_SIZE * 0.3,
    borderRadius: THUMB_SIZE * 0.25,
    backgroundColor: "rgba(255,255,255,0.8)",
  },
});
