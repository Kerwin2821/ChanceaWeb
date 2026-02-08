import { View, StyleSheet, Text, ActivityIndicator, Animated, Platform } from "react-native";
import { useRender } from "../../context/renderContext/RenderState";
import { Colors } from "../../utils";
import LottieView from "lottie-react-native";
import animation from "../../../assets/animation.json";
import { useEffect, useRef } from "react";
import { Easing } from "react-native-reanimated";
const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);

const AnimationLoadChancea = () => {
  return (
    <View style={{ width: 120, height: 120, overflow: 'hidden' }}>
      <LottieView source={animation} autoPlay loop resizeMode="contain" style={{ height: '100%', width: '100%' }} />
    </View>
  );
};

export default AnimationLoadChancea;
