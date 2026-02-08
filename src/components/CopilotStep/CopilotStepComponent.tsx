import { View, Text } from "react-native";
import React from "react";
import { CopilotProvider, CopilotStep, useCopilot, walkthroughable } from "react-native-copilot";

const CopilotView = walkthroughable(View);

const CopilotStepComponent = ({ children, message, step, name}: { children: any; message: string; step: number,name:string }) => {
  return (
    <CopilotStep text={message} order={step} name={name}>
      <CopilotView style={{flex:1, justifyContent:"center"}}>{children}</CopilotView>
    </CopilotStep>
  );
};

export default CopilotStepComponent;
