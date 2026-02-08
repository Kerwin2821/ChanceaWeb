import { View, StyleSheet, Text, ActivityIndicator, Animated, Platform } from 'react-native';
import { useRender } from '../../context/renderContext/RenderState';
import { Colors } from '../../utils';
import LottieView from "lottie-react-native";
import animation from "../../../assets/animation.json"
import { useEffect, useRef } from 'react';
import { Easing } from 'react-native-reanimated';
const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);

const AppLoader = () => {
  const { loader } = useRender();
  const animationProgress = useRef(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animationProgress.current, {
      toValue: 1,
      duration: 5000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, []);

  const animationCode = Animated.loop(
    Animated.timing(animationProgress.current, {
      toValue: 1,
      duration: 6000,
      easing: Easing.linear,
      useNativeDriver: false,
    }),
    {
      iterations: 1000,
    },
  );
  useEffect(() => {
    if (loader) {
      animationCode.start();
    } else {
      animationCode.stop();
    }
  }, [loader]);
  return (
    <View style={[
      style.container,
      StyleSheet.absoluteFillObject,
      loader ? { backgroundColor: 'rgba(255,255,255,0.5)' } : { backgroundColor: 'rgba(0,0,0,0)', pointerEvents: 'none' }
    ]}>
      {loader ? (
        <View style={{ width: 120, height: 120, overflow: 'hidden' }}>
          <LottieView
            source={animation}
            autoPlay
            loop
            resizeMode="contain"
            style={{ height: '100%', width: '100%' }}
          />
        </View>
      ) : null}
    </View>
  );
};
const style = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  }
});

export default AppLoader;
