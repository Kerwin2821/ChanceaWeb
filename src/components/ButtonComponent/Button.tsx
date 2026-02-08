import React, { useContext } from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { styles } from "./ButtonResources";
import { Props } from "./ButtonInterfaces";
import { Image } from "expo-image";
import { Entypo } from "@expo/vector-icons";
import { Colors } from "../../utils";

const Button = (props: Props) => {
  const {
    typeButton = "normal",
    styleIcon,
    disabled,
    styleButton,
    className,
    onPress,
    showIcon,
    icon,
    IconDirection,
    styleText,
    text,
  } = props;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        typeButton === "white" ? styles.buttonCancel : {},
        disabled ? styles.buttonDisabled : {},
        typeButton === "link" ? styles.buttonGhost : {},
        showIcon ? { flexDirection: "row" } : {},
        styleButton,
      ]}
      className={className}
      {...props}
      onPress={() => {
        onPress && onPress();
      }}
    >
      <View style={[
        styleIcon ? { ...styleIcon, position: "absolute",paddingHorizontal: 12  } : { position: "absolute", right: "0%", paddingHorizontal: 12  },
        IconDirection === "left" ? { position: "absolute", left: "0%" } : null,
        IconDirection === "right" ? { position: "absolute", right: "0%" } : null
        ]}>
        {showIcon ? icon ? icon : <Entypo name="fingerprint" size={24} color="black" /> : null}
      </View>
      <Text
        style={[
          styles.text,
          typeButton === "white" ? { color: Colors.black } : { color: Colors.white },
          disabled ? { color: Colors.white } : {},
          typeButton === "link" ? { color: Colors.black } : {},
          styleText,
          /* showIcon ? {paddingLeft:20} :{} */
        ]}
      >
        {text || "Continuar"}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;
