import type React from "react";
import { useState, useEffect, useMemo } from "react";
import { View, StyleProp, ActivityIndicator, Platform } from "react-native";
import CachedImage from "expo-cached-image";
import { height } from "../../utils/Helpers";
import { Colors } from "../../utils";
import { Image, ImageStyle } from "expo-image";

const extractFileName = (url: string): string => {
  const parts = url.split("/");
  const fileNameWithExtension = parts.pop() || "";
  return fileNameWithExtension;
};

interface CustomImageProps {
  source: { uri: string } | string;
  onLoadEnd?: () => void;
  styleImage?: StyleProp<ImageStyle>;
  classNameImage?: string;
}

const CacheImage: React.FC<CustomImageProps> = ({ source, styleImage, classNameImage, onLoadEnd }) => {
  const imageURl = useMemo(() => {
    const url = typeof source === 'string' ? source : source.uri;
    if (!url) return null;
    return url.replace(process.env.AWS_STORAGE as string, process.env.CLOUDFRONT as string);
  }, [source]);

  if (!imageURl) {
    return (
      <ActivityIndicator
        size="large"
        color={Colors.primary}
        style={{
          width: height / 12,
          height: height / 12,
          borderRadius: height / 10,
        }}
      />
    );
  }

  if (Platform.OS === 'web') {
    return (
      <Image
        source={{ uri: imageURl }}
        style={styleImage}
        className={classNameImage}
        onLoadEnd={() => onLoadEnd && onLoadEnd()}
        contentFit="cover"
      />
    );
  }

  return (
    <CachedImage
      cacheKey={extractFileName(imageURl)}
      source={{ uri: imageURl }}
      style={styleImage}
      className={classNameImage}
      placeholderContent={
        <ActivityIndicator
          size="large"
          color={Colors.primary}
          style={{
            width: height / 12,
            height: height / 12,
            borderRadius: height / 10,
          }}
        />
      }
      onLoadEnd={() => onLoadEnd && onLoadEnd()}
      resizeMode="cover"
    />
  );
};

export default CacheImage;
