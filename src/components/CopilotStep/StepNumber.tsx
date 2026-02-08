import React, { type FunctionComponent } from "react";
import { Text, View } from "react-native";
import { styles } from "./style";
import { useCopilot } from "react-native-copilot";

export const StepNumber = () => {
  const { currentStepNumber } = useCopilot();

  return (
    <View style={styles.stepNumber}>
      <Text style={styles.stepNumberText}>{currentStepNumber}</Text>
    </View>
  );
};