import { useState, useCallback } from "react";
import {
  ScrollView,
  Platform,
  RefreshControl,
  StatusBar,
  Dimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRender } from "../context";
import { height } from "../utils/Helpers";
import { Colors } from "../utils";
interface Props {
  onRefresh?: any;
  children?: any;
  backgroundColor?: string;
  disabledPaddingTop?: boolean;
  disabledPaddingBottom?: boolean;
  disabledStatusBar?: boolean;
}

const width: number = Dimensions.get("window").width;

const wait = () => {
  return new Promise((resolve) => {
    resolve(1);
  });
};

const ScreenContainer = ({
  backgroundColor,
  children,
  disabledPaddingTop,
  disabledPaddingBottom,
  disabledStatusBar,
}: Props) => {
  const { KeyboardStatus } = useRender();

  const Container = Platform.OS === "web" ? View : SafeAreaView;

  return (
    <Container style={{ flex: 1, backgroundColor: backgroundColor ?? Colors.white, paddingBottom: disabledPaddingBottom ? 0 : 40, alignItems: 'center', minHeight: Platform.OS === 'web' ? height : undefined }}>
      <View style={{ backgroundColor: "#FFFFFF", flex: 1, width: '100%', maxWidth: Platform.OS === 'web' ? 500 : '100%' }}>
        <View style={{ flex: 1, height: KeyboardStatus ? height + height / 6 : undefined }}>
          <View style={{ flex: 1 }}>
            {children}
          </View>
        </View>
      </View>
    </Container>

  );
};

export default ScreenContainer;
