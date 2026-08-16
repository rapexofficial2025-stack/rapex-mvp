import { useEffect, useRef } from "react";
import { Animated, ImageSourcePropType, Modal, PanResponder, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { X } from "lucide-react-native";

type Props = {
  visible: boolean;
  image: ImageSourcePropType | null;
  onClose: () => void;
};

/**
 * Full-screen pinch-zoom/pan preview for a single feature image, opened from
 * one of the Welcome screen's hex buttons. Built on core RN PanResponder (no
 * extra gesture library) to keep this project's zero-native-dependency
 * promise -- see README. X (top-right) closes and resets zoom/pan.
 */
export function FeaturePreviewModal({ visible, image, onClose }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const currentScale = useRef(1);
  const startDistance = useRef<number | null>(null);
  const startScale = useRef(1);
  const baseTranslate = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const id = scale.addListener(({ value }) => {
      currentScale.current = value;
    });
    return () => scale.removeListener(id);
  }, [scale]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startDistance.current = null;
      },
      onPanResponderMove: (evt, gesture) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length === 2) {
          const [a, b] = touches;
          const distance = Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
          if (startDistance.current === null) {
            startDistance.current = distance;
            startScale.current = currentScale.current;
          } else {
            const next = Math.min(Math.max((startScale.current * distance) / startDistance.current, 1), 4);
            scale.setValue(next);
          }
        } else if (touches.length === 1 && currentScale.current > 1) {
          translateX.setValue(baseTranslate.current.x + gesture.dx);
          translateY.setValue(baseTranslate.current.y + gesture.dy);
        }
      },
      onPanResponderRelease: (_evt, gesture) => {
        startDistance.current = null;
        if (currentScale.current <= 1) {
          baseTranslate.current = { x: 0, y: 0 };
          Animated.parallel([
            Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
            Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
          ]).start();
        } else {
          baseTranslate.current = {
            x: baseTranslate.current.x + gesture.dx,
            y: baseTranslate.current.y + gesture.dy,
          };
        }
      },
    })
  ).current;

  function handleClose() {
    scale.setValue(1);
    translateX.setValue(0);
    translateY.setValue(0);
    baseTranslate.current = { x: 0, y: 0 };
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.safe}>
          <Pressable style={styles.closeButton} onPress={handleClose} hitSlop={12}>
            <X color="#FFFFFF" size={22} />
          </Pressable>
        </SafeAreaView>

        <View style={styles.imageWrap} {...panResponder.panHandlers}>
          {image ? (
            <Animated.Image
              source={image}
              resizeMode="contain"
              style={[styles.image, { transform: [{ scale }, { translateX }, { translateY }] }]}
            />
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(6, 3, 16, 0.96)" },
  safe: { alignItems: "flex-end", paddingHorizontal: 16 },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  imageWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  image: { width: "100%", height: "100%" },
});
