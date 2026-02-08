import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface HeaderProps {
  title?: string;
  onBackPress?: () => void;
  showBackButton?: boolean;
}

const HeaderApp = ({ 
  title, 
  onBackPress, 
  showBackButton = true 
}: HeaderProps) => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View className="bg-primary pt-2 pb-4 px-4 flex-row items-center mb-2">
      {showBackButton && (
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-white/20 justify-center items-center"
          onPress={handleBackPress}
        >
          <FontAwesome5 name="chevron-left" size={22} color="white" />
        </TouchableOpacity>
      )}
      {title ? <Text className="text-white text-lg font-bold ml-4">{title}</Text> : <></>}
    </View>
  );
};

export default HeaderApp;