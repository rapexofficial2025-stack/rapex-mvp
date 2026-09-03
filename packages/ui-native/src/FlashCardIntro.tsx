import { useRef } from "react";
import { Dimensions, FlatList, Image, StyleSheet, View, type ImageSourcePropType, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";

export type FlashCardIntroProps = {
  /** Exactly 3 full-screen images, in swipe order (require(...) results or {uri} strings). */
  images: ImageSourcePropType[];
  /** Called once, after the user swipes past the last image. */
  onFinish: () => void;
};

const EXIT_PAGE = "__flashcard_exit__";
type FlashCardPage = ImageSourcePropType | typeof EXIT_PAGE;

/**
 * Full-screen, non-dismissable swipeable intro overlay -- mounted as a
 * sibling on top of an already-rendered screen (see each app's
 * MainTabNavigator, which shows this once right after the Login screen's
 * "Preview" button). No skip/close/tap-to-dismiss on purpose (founder
 * spec, 2026-08-21): the only way through is swiping past all `images` --
 * one extra swipe past the last real card lands on an invisible exit page
 * and immediately calls onFinish(), revealing the screen underneath.
 */
export function FlashCardIntro({ images, onFinish }: FlashCardIntroProps) {
  const { width, height } = Dimensions.get("window");
  const finishedRef = useRef(false);
  const pages: FlashCardPage[] = [...images, EXIT_PAGE];

  function handleMomentumEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    if (index >= images.length && !finishedRef.current) {
      finishedRef.current = true;
      onFinish();
    }
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      <FlatList
        data={pages}
        keyExtractor={(_, index) => String(index)}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumEnd}
        renderItem={({ item }) =>
          item === EXIT_PAGE ? (
            <View style={{ width, height }} />
          ) : (
            <Image source={item} style={{ width, height }} resizeMode="cover" />
          )
        }
      />
    </View>
  );
}
