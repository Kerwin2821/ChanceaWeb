import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { Button } from "./Button";

import { styles } from "./style";

import { useCopilot } from "react-native-copilot";
import { font } from "../../../styles";
import { AntDesign, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../../utils";

export interface TooltipProps {
  labels: Labels;
}

export type Labels = Partial<Record<"skip" | "previous" | "next" | "finish", string>>;

export const Tooltip = ({ labels }: TooltipProps) => {
  const { goToNext, goToPrev, stop, currentStep, isFirstStep, isLastStep } = useCopilot();

  const handleStop = () => {
    void stop();
  };
  const handleNext = () => {
    void goToNext();
  };

  const handlePrev = () => {
    void goToPrev();
  };

  return (
    <View>
      <View style={styles.tooltipContainer}>
        <Text testID="stepDescription" style={[font.Regular, { fontSize: 14 }]}>
          {currentStep?.text}
        </Text>
      </View>
      <View style={[styles.bottomBar]}>
        {!isLastStep ? (
          <TouchableOpacity className=" flex-row p-2 justify-center items-center gap-x-1 " onPress={handleStop}>
            <AntDesign name="closecircle" size={14} color={Colors.primary} />
            <Button>{"Saltar"}</Button>
          </TouchableOpacity>
        ) : null}
        {!isFirstStep ? (
          <TouchableOpacity className=" flex-row p-2 justify-center items-center gap-x-1" onPress={handlePrev}>
            <MaterialCommunityIcons name="arrow-left-drop-circle" size={18} color={Colors.primary} />
            <Button>{"Prev"}</Button>
          </TouchableOpacity>
        ) : null}
        {!isLastStep ? (
          <TouchableOpacity className=" flex-row p-2 justify-center items-center gap-x-1 " onPress={handleNext}>
            <Button>{"Sig"}</Button>
            <MaterialCommunityIcons name="arrow-right-drop-circle" size={18} color={Colors.primary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity className=" flex-row p-2 justify-center items-center gap-x-1 " onPress={handleStop}>
            <Button>{"Terminar"}</Button>
            <AntDesign name="checkcircle" size={14} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
