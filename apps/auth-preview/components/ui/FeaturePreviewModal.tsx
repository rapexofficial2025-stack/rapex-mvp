import { useEffect, useRef, useState } from "react";
import { Animated, ImageSourcePropType, LayoutChangeEvent, Modal, PanResponder, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { BlurView } from "expo-blur";

type Props = {
  visible: boolean;
  images: ImageSourcePropType[];
  onClose: () => void;
};

/**
 * Full-screen pinch-zoom/pan preview for a single feature image, opened from
 * one of the Welcome screen's hex buttons. Built on core RN PanResponder (no
 * extra gesture library) to keep this project's zero-native-dependency
 * promise -- see README. X (top-right) closes and resets zoom/pan.
 */
export function FeaturePreviewModal({ visible, images, onClose }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const pageTranslateX = useRef(new Animated.Value(0)).current;

  const currentScale = useRef(1);
  const startDistance = useRef<number | null>(null);
  const startScale = useRef(1);
  const baseTranslate = useRef({ x: 0, y: 0 });
  const imagesRef = useRef(images);
  const imageWidthRef = useRef(0);
  const isPagingRef = useRef(false);
  imagesRef.current = images;

  useEffect(() => {
    const id = scale.addListener(({ value }) => {
      currentScale.current = value;
    });
    return () => scale.removeListener(id);
  }, [scale]);

  useEffect(() => {
    if (visible) {
      setActiveIndex(0);
      resetTransform();
    }
  }, [visible, images]);

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
          if (Math.abs(gesture.dx) > 40 && imagesRef.current.length > 1) {
            showAdjacentImage(gesture.dx < 0 ? 1 : -1);
          }
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

  function showAdjacentImage(direction: 1 | -1) {
    if (isPagingRef.current) return;
    isPagingRef.current = true;
    const distance = Math.max(imageWidthRef.current, 1);
    const exitTo = direction === 1 ? -distance : distance;

    Animated.timing(pageTranslateX, { toValue: exitTo, duration: 180, useNativeDriver: true }).start(() => {
      setActiveIndex((index) => (index + direction + imagesRef.current.length) % imagesRef.current.length);
      pageTranslateX.setValue(-exitTo);
      Animated.timing(pageTranslateX, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => {
        isPagingRef.current = false;
      });
    });
  }

  function resetTransform() {
    scale.setValue(1);
    translateX.setValue(0);
    translateY.setValue(0);
    pageTranslateX.setValue(0);
    baseTranslate.current = { x: 0, y: 0 };
  }

  function handleClose() {
    resetTransform();
    onClose();
  }

  function handleImageLayout(event: LayoutChangeEvent) {
    imageWidthRef.current = event.nativeEvent.layout.width;
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} pointerEvents="none" />
        <SafeAreaView style={styles.safe}>
          <View style={styles.previewFrame}>
            <Pressable style={styles.closeButton} onPress={handleClose} hitSlop={12}>
              <X color="#FFFFFF" size={22} />
            </Pressable>

            <View style={styles.imageWrap} onLayout={handleImageLayout} {...panResponder.panHandlers}>
              {images[activeIndex] ? (
                <Animated.Image
                  source={images[activeIndex]}
                  resizeMode="contain"
                  style={[styles.image, { transform: [{ translateX: pageTranslateX }, { scale }, { translateX }, { translateY }] }]}
                />
              ) : null}
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(6, 3, 16, 0.2)" },
  safe: { flex: 1, paddingTop: 10, paddingHorizontal: 5, paddingBottom: 5 },
  previewFrame: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.3)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.6)",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  imageWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  image: { width: "100%", height: "100%" },
});
