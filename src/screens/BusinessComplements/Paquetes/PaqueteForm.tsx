"use client";

import { useCallback, useEffect, useState } from "react";
import { View, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useAuth, useRender } from "../../../context";
import { GetHeader } from "../../../utils/Helpers";
import { HttpService } from "../../../services";
import Button from "../../../components/ButtonComponent/Button";
import Select from "../../../components/Select/SelectComponent";
import type { Items } from "../../../utils/Interface";
import { useStoreBusiness } from "../../../context/storeBusinessHooks/useStoreBusiness";
import type { NavigationScreenNavigationType } from "../../../navigation/StackNavigator";
import Input from "../../../components/InputComponent/Input";
import type { BoxPackageRequest, CategoryResponse } from "../../../context/storeBusinessHooks/StoreBusinessInterface";
import Header from "../../../components/HeaderApp";
import InputCurrency from "../../../components/InputCurrency/InputCurrency";

const PaqueteForm = () => {
  const { TokenAuthApi, SesionToken } = useAuth();
  const { setLoader } = useRender();
  const { FormCreateBoxPackage, setFormCreateBoxPackage } = useStoreBusiness();
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const [Price, setPrice] = useState(0)

  // Package type options
  const [typeBoxDataItems] = useState<Items[]>([
    { label: "Regalo", value: "REGALO" },
    { label: "Desayuno", value: "DESAYUNO" },
    { label: "Almuerzo", value: "ALMUERZO" },
    { label: "Cena", value: "CENA" },
    { label: "Merienda", value: "MERIENDA" },
    { label: "Postre", value: "POSTRE" },
  ]);

  // Gift categories
  const [giftCategory, setGiftCategory] = useState<Items[]>([{ label: "", value: "" }]);

  // Fetch gift categories
  const getCategoryGift = async () => {
    try {
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/get/gif/category?page=0&size=100&sessionToken=${SesionToken}`;
      const headers = GetHeader(TokenAuthApi, "application/json");
      const response: CategoryResponse[] = await HttpService("get", host, url, {}, headers);

      if (response) {
        setGiftCategory(response.map((e) => ({ label: e.description, value: e.id })));
      }
      return response;
    } catch (error) {
      console.error("Error fetching gift categories: ", error);
    }
  };

  // Handle form field changes
  const change = useCallback(
    (value: string | number, key: keyof BoxPackageRequest) => {
      setFormCreateBoxPackage({
        ...FormCreateBoxPackage,
        [key]: value,
      });
    },
    [FormCreateBoxPackage, setFormCreateBoxPackage]
  );

  // Navigate to next screen
  const handleNext = () => {
    navigation.navigate("PaqueteProductoSelect");
  };

  // Calculate IVA and commission when amount changes
  useEffect(() => {
    const amount = Price;

    if (!isNaN(amount)) {
      setFormCreateBoxPackage({
        ...FormCreateBoxPackage,
        amount: Price + Price * 0.16 + Price * 0.2,
        iva: Price * 0.16,
        comission: Price * 0.2,
      });
    }
  }, [Price]);

  // Fetch gift categories on component mount
  useEffect(() => {
    getCategoryGift();
  }, []);

  // Check if form is valid for submission
  const isFormValid = FormCreateBoxPackage.amount && FormCreateBoxPackage.nombre && FormCreateBoxPackage.description && FormCreateBoxPackage.typeBox && (FormCreateBoxPackage.typeBox === "REGALO" ? FormCreateBoxPackage.gitCategory : true);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header title="Crear Paquete" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-4">
          {/* Package Name */}
          <View className="mb-4">
            <Input
              labelText="Nombre del Paquete"
              placeholder="Ej: Desayuno Especial"
              keyboardType="default"
              value={FormCreateBoxPackage.nombre}
              maxLength={50}
              onChangeText={(e: string) => change(e, "nombre")}
            />
          </View>

          {/* Package Description */}
          <View className="mb-4">
            <Input
              labelText="Descripción de Paquete"
              placeholder="Describe tu paquete detalladamente..."
              keyboardType="default"
              value={FormCreateBoxPackage.description}
              multiline
              maxLength={250}
              onChangeText={(e: string) => change(e, "description")}
            />
          </View>

          {/* Package Type */}
          <View className="mb-4">
            <Select
              items={typeBoxDataItems}
              labelText="Tipo de Paquete"
              onChange={(e: string | number) => {

                if(e === "REGALO") {
                  setFormCreateBoxPackage({
                    ...FormCreateBoxPackage,
                    typeBox:e,
                    gitCategory: "",
                  })
                }else{
                  setFormCreateBoxPackage({
                    ...FormCreateBoxPackage,
                    typeBox:e as string,
                  })
                }
              }}
              lengthText={13}
              styleText={{ paddingHorizontal: 0 }}
              value={FormCreateBoxPackage.typeBox}
            />
          </View>

          {/* Gift Category (conditional) */}
          {FormCreateBoxPackage.typeBox === "REGALO" && (
            <View className="mb-4">
              <Select
                items={giftCategory}
                labelText="Categoría de regalo"
                onChange={(e: string | number) => change(e, "gitCategory")}
                lengthText={13}
                styleText={{ paddingHorizontal: 0 }}
                value={FormCreateBoxPackage.gitCategory}
              />
            </View>
          )}

          {/* Price */}
          <View className="mb-4">
            <InputCurrency
              labelText="Precio ($)"
              placeholder="0.00"
              value={Price.toString()}
              maxLength={10}
              styleInput={{textAlign: "right"}}
              onChangeText={(e: string) => setPrice(Number(e))}
            />
          </View>

          {/* Commission and IVA */}
          <View className="flex-row justify-between mb-4">
            <View className="w-[48%]">
              <Input
                labelText="Comisión"
                placeholder="0.00"
                keyboardType="numeric"
                value={FormCreateBoxPackage.comission.toFixed(2)}
                disabled={true}
              />
            </View>
            <View className="w-[48%]">
              <Input
                labelText="IVA"
                placeholder="0.00"
                keyboardType="numeric"
                value={FormCreateBoxPackage.iva.toFixed(2)}
                disabled={true}
              />
            </View>
          </View>
          <View className="flex-row justify-center gap-2 ">
              <Text className="text-xl font-bold text-secondary">Total:</Text>
              <Text className="text-xl font-bold text-primary">
                $
                {(FormCreateBoxPackage.amount).toFixed(2)}
              </Text>
            </View>
          {/* Next Button */}
          <View className="mt-6 mb-8">
            <Button text={"Siguiente"} disabled={!isFormValid} onPress={handleNext} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PaqueteForm;
