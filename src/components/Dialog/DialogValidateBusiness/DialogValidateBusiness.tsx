import React from "react";
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { Dialog } from "@rn-vui/themed";
import { font } from "../../../../styles";
import { Colors } from "../../../utils";
import Button from "../../ButtonComponent/Button";
import { MaterialIcons, FontAwesome5, Ionicons } from "@expo/vector-icons";

type props = {
  active: boolean;
  setActive: (e: boolean) => void;
  onContactSupport?: () => void;
  isLoading?: boolean;
};

const DialogValidateBusiness = ({ active, setActive, onContactSupport, isLoading = false }: props) => {
  const toggleDialog = () => {
    setActive(!active);
  };

  if (!active) {
    return <></>;
  }

  return (
    <Dialog
      isVisible={active}
      onBackdropPress={toggleDialog}
      overlayStyle={{ backgroundColor: Colors.primary, borderRadius: 14, width: "90%" }}
    >
      {isLoading && (
        <View
          className="absolute top-0 left-0 right-0 bottom-0 justify-center z-10"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <ActivityIndicator color={Colors.white} size={64} />
        </View>
      )}
      
      <View className="items-center mb-4">
        <MaterialIcons name="access-time" size={60} color={Colors.white} />
      </View>
      
      <Text style={[{ textAlign: "center", fontSize: 24, color: Colors.white, marginBottom: 12 }, font.Bold]}>
        Verificación en Proceso
      </Text>
      
      <ScrollView className="max-h-[60%]">
        <View className="bg-white p-4 rounded-lg mb-4">
          <Text style={[{ fontSize: 16, color: Colors.secondary, marginBottom: 12 }, font.SemiBold]}>
            Tu cuenta está siendo verificada
          </Text>
          
          <Text style={[{ fontSize: 14, color: Colors.black, marginBottom: 16 }, font.Regular]}>
            Estamos procesando tu información. Una vez completada la verificación, podrás:
          </Text>
          
          <View className="mb-2 flex-row items-center">
            <FontAwesome5 name="box" size={20} color={Colors.secondary} />
            <Text style={[{ fontSize: 14, color: Colors.black, marginLeft: 8 }, font.Regular]}>
              Crear y gestionar productos
            </Text>
          </View>
          
          <View className="mb-2 flex-row items-center">
            <FontAwesome5 name="shopping-bag" size={20} color={Colors.secondary} />
            <Text style={[{ fontSize: 14, color: Colors.black, marginLeft: 8 }, font.Regular]}>
              Crear paquetes promocionales
            </Text>
          </View>
          
          <View className="mb-2 flex-row items-center">
            <Ionicons name="checkmark-circle" size={20} color={Colors.secondary} />
            <Text style={[{ fontSize: 14, color: Colors.black, marginLeft: 8 }, font.Regular]}>
              Acceder a todas las funciones de la plataforma
            </Text>
          </View>
        </View>
        
        <View className="bg-white p-4 rounded-lg">
          <Text style={[{ fontSize: 16, color: Colors.secondary, marginBottom: 8 }, font.SemiBold]}>
            Estado del proceso:
          </Text>
          
          <View className="flex-row items-center mb-3">
            <View className="w-6 h-6 rounded-full bg-secondary items-center justify-center mr-2">
              <Text style={[{ color: Colors.white, fontSize: 12 }, font.Bold]}>1</Text>
            </View>
            <Text style={[{ fontSize: 14, color: Colors.black, flex: 1 }, font.SemiBold]}>
              Información recibida
            </Text>
            <Ionicons name="checkmark-circle" size={20} color={Colors.secondary} />
          </View>
          
          <View className="flex-row items-center mb-3">
            <View className="w-6 h-6 rounded-full bg-secondary items-center justify-center mr-2">
              <Text style={[{ color: Colors.white, fontSize: 12 }, font.Bold]}>2</Text>
            </View>
            <Text style={[{ fontSize: 14, color: Colors.black, flex: 1 }, font.SemiBold]}>
              Verificación en curso
            </Text>
            <MaterialIcons name="access-time" size={20} color={Colors.secondary} />
          </View>
          
          <View className="flex-row items-center">
            <View className="w-6 h-6 rounded-full bg-gray-300 items-center justify-center mr-2">
              <Text style={[{ color: Colors.white, fontSize: 12 }, font.Bold]}>3</Text>
            </View>
            <Text style={[{ fontSize: 14, color: "gray", flex: 1 }, font.Regular]}>
              Verificación completada
            </Text>
          </View>
          
          <Text style={[{ fontSize: 14, color: Colors.secondary, marginTop: 16, textAlign: 'center' }, font.SemiBold]}>
            Tiempo estimado: 24-48 horas
          </Text>
        </View>
      </ScrollView>
      
      <View className="mt-4">
      {/*   <Button
          text="Entendido"
          onPress={toggleDialog}
          styleContainer={{ backgroundColor: Colors.white }}
          styleText={{ color: Colors.secondary }}
        /> */}
      </View>
      
      <TouchableOpacity 
        className="mt-3" 
        onPress={() => {
          if (onContactSupport) {
            onContactSupport();
            toggleDialog();
          }
        }}
      >
        <Text style={[{ textAlign: "center", fontSize: 14, color: Colors.white }, font.Regular]}>
          ¿Tienes preguntas? Contacta a soporte
        </Text>
      </TouchableOpacity>
    </Dialog>
  );
};

export default DialogValidateBusiness;