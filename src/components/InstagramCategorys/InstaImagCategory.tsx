import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { Dimensions, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Colors } from "../../utils";
import { UserData } from "../../context/AuthContext/AuthInterface";
import CacheImage from "../CacheImage/CacheImage";

type Props = {
  item: UserData;
  index: number;
  onPress: (item: UserData) => void;
  itemSelect?: UserData;
};

const { width, height } = Dimensions.get("window");

function InstaImagCategory({ item, index, onPress, itemSelect }: Props) {

  const imageUrl = item.customerProfiles[0].link;

  const ChangeCategory = () => onPress(item);

  return (
    <View className="mt-1">
      <TouchableOpacity
        style={{
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
          marginRight: 10,
          gap: 5,
        }}
        onPress={ChangeCategory}
      >
        <View style={{ borderWidth: 2, padding: 4, borderRadius: 100, borderColor: Colors.primary }}>
          <CacheImage
            styleImage={{
              width: 70,
              height: 70,
              borderRadius: 35,
              backgroundColor: Colors.transparent,
            }}
            source={imageUrl}
          />
        </View>
        <Text style={{ fontSize: 9, textAlign: "center", fontFamily: "Bold" }}>
          {`${item.firstName}`.slice(0, 15)}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default InstaImagCategory;