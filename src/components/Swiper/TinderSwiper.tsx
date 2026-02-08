"use client"
import React, { useCallback, useMemo, useState, useEffect } from "react"
import { View, Dimensions, StyleSheet, Text, type ViewStyle } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
} from "react-native-reanimated"
import { AntDesign, Entypo } from "@expo/vector-icons"

import { Platform } from "react-native"

const { width: windowWidth, height: windowHeight } = Dimensions.get("window")
const SCREEN_WIDTH = Platform.OS === "web" ? Math.min(windowWidth, 500) : windowWidth
const SCREEN_HEIGHT = windowHeight
const CARD_WIDTH = SCREEN_WIDTH
const CARD_HEIGHT = SCREEN_HEIGHT * 0.9 - 49
const SWIPE_THRESHOLD = CARD_WIDTH / 4
const ROTATION_RANGE = [-CARD_WIDTH / 2, 0, CARD_WIDTH / 2]
const ROTATION_OUTPUT = [-10, 0, 10]
const OVERLAY_OPACITY_RANGE = [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD]

interface TinderSwiperProps<T> {
  data: T[]
  renderCard: (item: T, index: number, isFocused: boolean) => React.ReactNode
  onSwipeLeft?: (item: T, index: number) => void
  onSwipeRight?: (item: T, index: number) => void
  onSwipedAll?: () => void
  onFocusChange?: (focusedIndex: number, focusedItem: T | null) => void
  indexInitial?: number
  stackSize?: number
  cardHorizontalMargin?: number
  cardVerticalMargin?: number
  enableVerticalSwipe?: boolean
}

const OverlayLabel = ({
  label,
  color,
  icon,
  style,
}: {
  label: string
  color: string
  icon: React.ReactNode
  style?: any
}) => (
  <Animated.View style={[styles.overlayLabelContainer, { borderColor: color }, style]}>
    {icon}
    <Text style={[styles.overlayLabelText, { color }]}>{label}</Text>
  </Animated.View>
)

function TinderSwiper<T extends { id: string | number }>(
  {
    data,
    renderCard,
    onSwipeLeft,
    onSwipeRight,
    onSwipedAll,
    onFocusChange,
    indexInitial = 0,
    stackSize = 3,
    cardHorizontalMargin = 0,
    cardVerticalMargin = 0,
    enableVerticalSwipe = false,
  }: TinderSwiperProps<T>,
  ref: React.Ref<any>,
) {
  const [currentIndex, setCurrentIndex] = useState(indexInitial)
  const [focusedIndex, setFocusedIndex] = useState(indexInitial)
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const startX = useSharedValue(0)
  const startY = useSharedValue(0)

  useEffect(() => {
    const focusedItem = data[focusedIndex] || null
    onFocusChange?.(focusedIndex, focusedItem)
  }, [focusedIndex, data, onFocusChange])

  // Sync internal state with external indexInitial if it changes
  useEffect(() => {
    if (indexInitial !== currentIndex) {
      setCurrentIndex(indexInitial)
      setFocusedIndex(indexInitial)
    }
  }, [indexInitial])

  const moveToNextCard = useCallback(() => {
    translateX.value = 0
    translateY.value = 0
    const nextIndex = currentIndex + 1
    if (nextIndex < data.length) {
      setCurrentIndex(nextIndex)
      setFocusedIndex(nextIndex)
    } else {
      onSwipedAll?.()
    }
  }, [currentIndex, data.length, onSwipedAll, translateX, translateY])

  const onSwipeComplete = useCallback(
    (direction: "left" | "right") => {
      const swipedCard = data[currentIndex]
      if (direction === "left") {
        onSwipeLeft?.(swipedCard, currentIndex)
      } else {
        onSwipeRight?.(swipedCard, currentIndex)
      }
      // Eliminado el setTimeout para una transición más rápida
      moveToNextCard()
    },
    [currentIndex, data, onSwipeLeft, onSwipeRight, moveToNextCard],
  )

  const swipeLeft = useCallback(() => {
    runOnJS(onSwipeComplete)("left")
  }, [onSwipeComplete])

  const swipeRight = useCallback(() => {
    runOnJS(onSwipeComplete)("right")
  }, [onSwipeComplete])

  React.useImperativeHandle(ref, () => ({
    swipeLeft,
    swipeRight,
    getCurrentIndex: () => currentIndex,
    getFocusedIndex: () => focusedIndex,
    isFocused: (index: number) => index === focusedIndex,
  }))

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value
      startY.value = translateY.value
    })
    .onUpdate((event) => {
      translateX.value = startX.value + event.translationX
      translateY.value = enableVerticalSwipe
        ? startY.value + event.translationY
        : startY.value + Math.max(-20, Math.min(20, event.translationY))
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        const direction = event.translationX > 0 ? "right" : "left"
        translateX.value = withSpring(
          SCREEN_WIDTH * 1.5 * Math.sign(event.translationX),
          { damping: 20, stiffness: 90 },
          (finished) => {
            if (finished) {
              runOnJS(onSwipeComplete)(direction)
            }
          },
        )
      } else {
        translateX.value = withSpring(0)
        translateY.value = withSpring(0)
      }
    })

  const topCardAnimatedStyle = useAnimatedStyle(() => {
    const rotateZ = `${interpolate(translateX.value, ROTATION_RANGE, ROTATION_OUTPUT, Extrapolate.CLAMP)}deg`
    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, SWIPE_THRESHOLD * 2, SCREEN_WIDTH],
      [1, 0.5, 0],
      Extrapolate.CLAMP,
    )
    return {
      transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { rotateZ }],
      opacity,
    }
  })

  const likeOpacity = useAnimatedStyle(() => {
    return { opacity: interpolate(translateX.value, OVERLAY_OPACITY_RANGE, [0, 0, 1], Extrapolate.CLAMP) }
  })

  const nopeOpacity = useAnimatedStyle(() => {
    return { opacity: interpolate(translateX.value, OVERLAY_OPACITY_RANGE, [1, 0, 0], Extrapolate.CLAMP) }
  })

  const renderCards = useMemo(() => {
    if (currentIndex >= data.length) {
      return (
        <View style={styles.noMoreCards}>
          <Text style={styles.noMoreCardsText}>No hay más cartas</Text>
        </View>
      )
    }

    const visibleCards = data.slice(currentIndex, currentIndex + stackSize)
    const cardsToRender = visibleCards

    return cardsToRender.map((item, indexOffset) => {
      const index = currentIndex + indexOffset
      const isTopCard = index === currentIndex
      const isFocused = index === focusedIndex
      const cardOffset = index - currentIndex
      const stackCardStyle = {
        transform: [{ scale: 1 - cardOffset * 0.03 }, { translateY: cardOffset * 8 }],
        zIndex: stackSize - cardOffset,
      }

      return (
        <Animated.View
          key={item.id.toString()}
          style={[
            styles.cardContainer,
            {
              width: CARD_WIDTH,
              height: CARD_HEIGHT + 20,
              left: cardHorizontalMargin - 10,
              top: cardVerticalMargin - 10,
            },
            stackCardStyle,
            isTopCard && topCardAnimatedStyle,
          ]}
        >
          {isTopCard && (
            <>
              <OverlayLabel
                label="No me cuadra"
                color="#FF5864"
                icon={<Entypo name="cross" size={32} color="#FF5864" />}
                style={[nopeOpacity, { left: 20 }]}
              />
              <OverlayLabel
                label="Me cuadra"
                color="#6DEB6D"
                icon={<AntDesign name="heart" size={22} color="#6DEB6D" />}
                style={[likeOpacity, { right: 20 }]}
              />
            </>
          )}
          <View style={styles.cardContent}>
            {isTopCard ? (
              <GestureDetector gesture={panGesture}>
                <Animated.View style={styles.gestureContainer}>{renderCard(item, index, isFocused)}</Animated.View>
              </GestureDetector>
            ) : (
              renderCard(item, index, isFocused)
            )}
          </View>
        </Animated.View>
      )
    })
  }, [
    data,
    currentIndex,
    focusedIndex,
    stackSize,
    renderCard,
    cardHorizontalMargin,
    cardVerticalMargin,
    topCardAnimatedStyle,
    panGesture,
    likeOpacity,
    nopeOpacity,
  ])

  return <View style={styles.wrapper}>{renderCards}</View>
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  cardContainer: {
    position: "absolute",
    overflow: "hidden",
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  cardContent: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  gestureContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlayLabelContainer: {
    position: "absolute",
    top: 60,
    padding: 12,
    borderRadius: 8,
    borderWidth: 3,
    zIndex: 1000,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  overlayLabelText: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  noMoreCards: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  noMoreCardsText: {
    fontSize: 22,
    color: "gray",
    textAlign: "center",
  },
})

export default React.forwardRef(TinderSwiper) as <T extends { id: string | number }>(
  props: TinderSwiperProps<T> & { ref?: React.Ref<any> },
) => React.ReactElement
