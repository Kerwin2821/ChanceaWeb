"use client";

import { useState, useCallback, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { CommonActions, useNavigation, useRoute } from "@react-navigation/native";
import { GetHeader, ToastCall } from "../../../utils/Helpers";
import { HttpService } from "../../../services";
import Input from "../../../components/InputComponent/Input";
import Button from "../../../components/ButtonComponent/Button";
import { Colors } from "../../../utils";
import { useAuth, useRender } from "../../../context";
import { useStoreBusiness } from "../../../context/storeBusinessHooks/useStoreBusiness";
import type { NavigationScreenNavigationType } from "../../../navigation/StackNavigator";
import { useSesionBusinessStore } from "../../../context/AuthBusinessHooks/useAuthBusinessHooks";
import { initialFormCreateTienda, Paquetes, Stores } from "../../../context/storeBusinessHooks/StoreBusinessInterface";
import { BottomTabBusinessNavigationType } from "../../../navigationBusiness/BottomTabBusiness";
import HeaderApp from "../../../components/HeaderApp";

function StorePassword() {
  const { TokenAuthApi, SesionToken } = useAuth();
  const { language, setLoader } = useRender();
  const { FormCreateTienda, setFormCreateTienda, Stores, setStores } = useStoreBusiness();

  const navigation = useNavigation<NavigationScreenNavigationType>();
  const navigationBottom = useNavigation<BottomTabBusinessNavigationType>();
  const { sesionBusiness } = useSesionBusinessStore();

  const [countLength, setCountLength] = useState<boolean>(false);
  const [equals, setEquals] = useState<boolean>(false);
  const [credentialRepeat, setCredentialRepeat] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const route = useRoute();
  const data = route.params as { storeId: number } | undefined;
  const store = data?.storeId ? Stores.find((s) => s.id === data.storeId) : undefined;

  const disable = () => {
    const { password } = FormCreateTienda;
    return !(password?.length >= 4) || !(credentialRepeat.length >= 4);
  };

  const onSubmit = async () => {
    try {
      setLoader(true);

      const { password } = FormCreateTienda;

      if (password !== credentialRepeat) {
        ToastCall("warning", "Las contraseñas no coinciden", language);
        return;
      }

      const host = process.env.APP_BASE_API;
      const url = "/api/appchancea/store-businesses";
      const headers = await GetHeader(TokenAuthApi, "application/json");

      console.log(FormCreateTienda)

      const response:Stores = await HttpService("post", host, url, { ...FormCreateTienda, business: sesionBusiness }, headers);
      setFormCreateTienda(initialFormCreateTienda);

      ToastCall("success", "Tienda creada exitosamente", language);
      setStores([...Stores,response])
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "HomeBusiness",
            state: {
                routes: [
                  {
                    name: "PerfilBusinessScreen", // Nombre del tab en el BottomTabNavigator
                  },
                ],
                index: 0,
              },
           }],
        })
      );

      /* navigation.navigate("HomeBusiness"); */
    } catch (err) {
      console.log(JSON.stringify(err));
      ToastCall("error", "Ha ocurrido un error al crear la tienda", language);
    } finally {
      setLoader(false);
    }
  };

  async function sendUpdate() {
    try {
      if (!store) return;

      setLoader(true);
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/store-businesses/changePassword?sessionToken=${SesionToken}`;
      const header = await GetHeader(TokenAuthApi, "application/json");

      await HttpService(
        "post",
        host,
        url,
        {
          storeId: store.id,
          newPassword: FormCreateTienda.password,
        },
        header
      );

      setFormCreateTienda(initialFormCreateTienda);
      ToastCall("success", "Contraseña de tienda actualizada con éxito", "ES");
      navigation.goBack();
    } catch (err: any) {
      console.error(JSON.stringify(err));
      if (err && err?.status) {
        ToastCall("error", "Error de conexión con el servidor", "ES");
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES");
      }
    } finally {
      setLoader(false);
    }
  }

  const validatePassword = useCallback(
    (value: string) => {
      if (value.length >= 8) {
        setCountLength(true);
      } else {
        countLength && setCountLength(false);
      }

      if (value.length === 0) {
        setCountLength(false);
        setEquals(false);
      }
    },
    [countLength]
  );

  const change = (value: string, key: string) => {
    key === "password" && validatePassword(value);

    setFormCreateTienda({
      ...FormCreateTienda,
      [key]: value,
    });
  };

  useEffect(() => {
    const { password } = FormCreateTienda;
    setEquals(password.length && credentialRepeat.length ? password === credentialRepeat : false);
  }, [FormCreateTienda, credentialRepeat]);

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <HeaderApp title={store ? "Cambiar Contraseña" : "Configurar Contraseña"}/>
      

      <View className="flex-1 px-6 pt-6">
        {/* Store Info */}
        {store && (
          <View className="mb-6 items-center">
            <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-2">
              <FontAwesome5 name="store" size={28} color={Colors.primary} />
            </View>
            <Text className="text-lg font-bold text-secondary">{store.name}</Text>
            <Text className="text-sm text-gray-500">{store.email}</Text>
          </View>
        )}

        {/* Title and Instructions */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-center text-secondary mb-4">
            {store ? "Actualizar Contraseña" : "Crear Contraseña de Tienda"}
          </Text>

          <Text className="text-sm text-gray-600 text-center mb-4">
            Esta contraseña será utilizada para acceder a la información y gestión de la tienda. Por favor, asegúrate de
            recordarla.
          </Text>
        </View>

        {/* Password Requirements */}
        <View className="mb-6 bg-gray-50 p-4 rounded-lg">
          <Text className="text-base font-semibold text-secondary mb-2">Requisitos:</Text>

          <View className="flex-row items-center mb-2">
            <View className="w-6 h-6 items-center justify-center">
              {countLength ? (
                <Feather name="check-circle" size={18} color={Colors.primary} />
              ) : (
                <View className="w-4 h-4 rounded-full border border-gray-400" />
              )}
            </View>
            <Text className={`text-sm ml-2 ${countLength ? "text-primary" : "text-gray-600"}`}>
              Mínimo de 8 caracteres
            </Text>
          </View>

          <View className="flex-row items-center">
            <View className="w-6 h-6 items-center justify-center">
              {equals ? (
                <Feather name="check-circle" size={18} color={Colors.primary} />
              ) : (
                <View className="w-4 h-4 rounded-full border border-gray-400" />
              )}
            </View>
            <Text className={`text-sm ml-2 ${equals ? "text-primary" : "text-gray-600"}`}>
              Las contraseñas coinciden
            </Text>
          </View>
        </View>

        {/* Password Input */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-secondary mb-2">Contraseña</Text>
          <View className="relative">
            <Input
              placeholder="Ingresa tu contraseña"
              secureTextEntry={!showPassword}
              onChangeText={(e: string) => {
                change(e, "password");
              }}
              keyboardType="default"
              value={FormCreateTienda.password}
              maxLength={20}
            />
          </View>
        </View>

        {/* Confirm Password Input */}
        <View className="mb-8">
          <Text className="text-sm font-semibold text-secondary mb-2">Confirmar Contraseña</Text>
          <View className="relative">
            <Input
              placeholder="Confirma tu contraseña"
              secureTextEntry={!showConfirmPassword}
              onChangeText={(e: string) => {
                setCredentialRepeat(e);
              }}
              keyboardType="default"
              value={credentialRepeat}
              maxLength={20}
            />
          </View>

          {FormCreateTienda.password && credentialRepeat && !equals && (
            <Text className="text-red-500 text-xs mt-1 ml-1">Las contraseñas no coinciden</Text>
          )}
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-between mb-8">
          <View className="w-[45%]">
            <Button text="Cancelar" onPress={() => navigation.goBack()} typeButton="white" />
          </View>

          <View className="w-[45%]">
            <Button
              text={store ? "Actualizar" : "Crear Tienda"}
              disabled={disable()}
              onPress={() => {
                store ? sendUpdate() : onSubmit();
              }}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

export default StorePassword;
