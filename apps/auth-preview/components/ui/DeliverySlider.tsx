import { useEffect, useRef, useState, useCallback } from "react";
import { Animated, LayoutChangeEvent, PanResponder, StyleSheet, Text, View } from "react-native";
import { BlurView } from "expo-blur";

type DeliverySliderProps = {
  label?: string;
  onComplete: () => void;
};

const BOX_SIZE = 53;
const TRACK_HEIGHT = 58;
const TRACK_PADDING = 5;
const HOUSE_SIZE = 40;
const HOUSE_RIGHT_OFFSET = TRACK_PADDING + 5;
const COMPLETION_THRESHOLD = 0.98;

// RAPEX Design System colors
const GLASS_BG = "rgba(18, 20, 24, 0.9)";
const GLASS_BORDER = "rgba(255, 255, 255, 0.18)";
const TEXT_COLOR = "#E5E7EB";
const TEXT_SECONDARY = "#9CA3AF";
const SUCCESS_COLOR = "#22C55E";

/**
 * Premium glass-style horizontal delivery slider.
 *
 * A reusable component for the Welcome screen that allows users to drag a ðŸ“¦ (delivery box)
 * from left to right towards a ðŸ  (house) destination. When the box reaches ~92% of the
 * track distance, it snaps to completion, displays "DELIVERED!" and calls the onComplete
 * callback exactly once.
 *
 * Supports repeated use by resetting state after completion.
 */
export function DeliverySlider({ label = "SWIPE TO BEGIN", onComplete }: DeliverySliderProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [displayText, setDisplayText] = useState(label);

  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const idleBoxX = useRef(new Animated.Value(0)).current;
  const idleBoxRotate = useRef(new Animated.Value(0)).current;
  const idleHouseY = useRef(new Animated.Value(0)).current;
  const idleHouseRotate = useRef(new Animated.Value(0)).current;
  const completedRef = useRef(false);
  const isInteractingRef = useRef(false);
  const maxTranslate = Math.max(trackWidth - HOUSE_RIGHT_OFFSET - HOUSE_SIZE - TRACK_PADDING - BOX_SIZE, 1);
  const maxTranslateRef = useRef(maxTranslate);
  maxTranslateRef.current = maxTranslate;

  function stopIdleMotion() {
    idleBoxX.stopAnimation();
    idleBoxRotate.stopAnimation();
    idleHouseY.stopAnimation();
    idleHouseRotate.stopAnimation();
    idleBoxX.setValue(0);
    idleBoxRotate.setValue(0);
    idleHouseY.setValue(0);
    idleHouseRotate.setValue(0);
  }

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let disposed = false;

    const playIdleCue = () => {
      if (disposed) return;
      if (isInteractingRef.current || completedRef.current) {
        timer = setTimeout(playIdleCue, 10000);
        return;
      }

      Animated.sequence([
        Animated.parallel([
          Animated.timing(idleBoxX, { toValue: -3, duration: 140, useNativeDriver: false }),
          Animated.timing(idleBoxRotate, { toValue: -2, duration: 140, useNativeDriver: false }),
        ]),
        Animated.parallel([
          Animated.timing(idleBoxX, { toValue: 3, duration: 180, useNativeDriver: false }),
          Animated.timing(idleBoxRotate, { toValue: 2, duration: 180, useNativeDriver: false }),
        ]),
        Animated.parallel([
          Animated.timing(idleBoxX, { toValue: 0, duration: 140, useNativeDriver: false }),
          Animated.timing(idleBoxRotate, { toValue: 0, duration: 140, useNativeDriver: false }),
        ]),
        Animated.delay(180),
        Animated.parallel([
          Animated.timing(idleHouseY, { toValue: -2, duration: 150, useNativeDriver: false }),
          Animated.timing(idleHouseRotate, { toValue: -3, duration: 150, useNativeDriver: false }),
        ]),
        Animated.parallel([
          Animated.timing(idleHouseY, { toValue: -1, duration: 170, useNativeDriver: false }),
          Animated.timing(idleHouseRotate, { toValue: 3, duration: 170, useNativeDriver: false }),
        ]),
        Animated.parallel([
          Animated.timing(idleHouseY, { toValue: 0, duration: 150, useNativeDriver: false }),
          Animated.timing(idleHouseRotate, { toValue: 0, duration: 150, useNativeDriver: false }),
        ]),
      ]).start(({ finished }) => {
        if (!disposed && finished) timer = setTimeout(playIdleCue, 10000);
      });
    };

    timer = setTimeout(playIdleCue, 10000);
    return () => {
      disposed = true;
      if (timer) clearTimeout(timer);
      stopIdleMotion();
    };
  }, [idleBoxRotate, idleBoxX, idleHouseRotate, idleHouseY]);

  // Reset capability: allow the component to be used again after completion
  const reset = useCallback(() => {
    setIsCompleted(false);
    setDisplayText(label);
    completedRef.current = false;
    Animated.parallel([
      Animated.timing(translateX, { toValue: 0, duration: 300, useNativeDriver: false }),
      Animated.timing(scale, { toValue: 1, duration: 300, useNativeDriver: false }),
    ]).start();
  }, [label, translateX, scale]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_evt, gesture) => Math.abs(gesture.dx) > 3,
      onPanResponderGrant: () => {
        isInteractingRef.current = true;
        stopIdleMotion();
      },
      onPanResponderMove: (_evt, gesture) => {
        if (completedRef.current) return;
        const next = Math.min(Math.max(gesture.dx, 0), maxTranslateRef.current);
        translateX.setValue(next);

        // Add subtle scale response while dragging
        const progress = next / maxTranslateRef.current;
        scale.setValue(1 + progress * 0.08); // Grow up to 8% while dragging
      },
      onPanResponderRelease: (_evt, gesture) => {
        if (completedRef.current) return;
        isInteractingRef.current = false;
        const next = Math.min(Math.max(gesture.dx, 0), maxTranslateRef.current);
        const progress = next / maxTranslateRef.current;

        // Check if drag reached completion threshold
        if (progress >= COMPLETION_THRESHOLD) {
          completedRef.current = true;
          setIsCompleted(true);

          // Snap to destination
          Animated.parallel([
            Animated.timing(translateX, { toValue: maxTranslateRef.current, duration: 200, useNativeDriver: false }),
            Animated.timing(scale, { toValue: 0.99, duration: 150, useNativeDriver: false }),
          ]).start(() => {
            setDisplayText("SUCCESS!"); // Update text to indicate completion
            // Call onComplete exactly once
            onComplete();
          });
        } else {
          // Return to start with spring animation
          Animated.parallel([
            Animated.spring(translateX, { toValue: 0, useNativeDriver: false }),
            Animated.timing(scale, { toValue: 1, duration: 300, useNativeDriver: false }),
          ]).start();
        }
      },
    })
  ).current;

  function handleLayout(e: LayoutChangeEvent) {
    setTrackWidth(e.nativeEvent.layout.width);
  }

  return (
    <View style={styles.container}>
      {/* Glass background track */}
      <BlurView intensity={40} style={styles.track} onLayout={handleLayout}>
        {/* Glass surface overlay */}
        <View
          style={[
            styles.trackSurface,
            {
              backgroundColor: GLASS_BG,
              borderColor: GLASS_BORDER,
            },
          ]}
        >
          {/* Center text */}
          <Text style={[styles.centerText, isCompleted && styles.centerTextCompleted]} pointerEvents="none">
            {displayText}
          </Text>

          {/* Right emoji: house destination ðŸ  */}
          <View style={[styles.emojiContainer, styles.rightEmoji]} pointerEvents="none">
            <Animated.Text
              style={[
                styles.emoji,
                {
                  transform: [
                    { translateY: idleHouseY },
                    { rotate: idleHouseRotate.interpolate({ inputRange: [-3, 3], outputRange: ["-3deg", "3deg"] }) },
                  ],
                },
              ]}
            >
              🏠
            </Animated.Text>
          </View>

          {/* Draggable box handle */}
          <Animated.View
            style={[
              styles.dragHandle,
              {
                transform: [
                  { translateX: idleBoxX },
                  { rotate: idleBoxRotate.interpolate({ inputRange: [-2, 2], outputRange: ["-2deg", "2deg"] }) },
                  { scale },
                  { translateX },
                ],
              },
            ]}
            {...panResponder.panHandlers}
          >
            <View style={styles.handleContent}>
              <Text style={styles.boxEmoji}>📦</Text>
            </View>
          </Animated.View>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "105%",
    alignItems: "center",
    left:-8,
    gap: 12,
    borderRadius: 30,
  },
  track: {
    width: "100%",
    height: TRACK_HEIGHT,
    overflow: "visible",
  },
  trackSurface: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: "visible",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: TRACK_PADDING,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  emojiContainer: {
    position: "absolute",
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  rightEmoji: {
    right: HOUSE_RIGHT_OFFSET,
  },
  emoji: {
    fontSize: 35,
  },
  centerText: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_COLOR,
    textAlign: "center",
    letterSpacing: 5,
  },
  centerTextCompleted: {
    fontSize: 16,
    fontWeight: "800",
    color: SUCCESS_COLOR, // Green for completion
  },
  dragHandle: {
    position: "absolute",
    top: 1,
    left: TRACK_PADDING,
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: 25,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  handleContent: {
    flex: 1,
    backgroundColor: "rgba(42, 45, 52, 0.92)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  boxEmoji: {
    fontSize: 39,
  },
});



