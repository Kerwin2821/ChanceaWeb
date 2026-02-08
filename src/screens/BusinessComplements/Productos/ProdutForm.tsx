import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenContainer from "../../../components/ScreenContainer";
import { useAuth, useRender } from "../../../context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Respresentante } from "../Representante/RepresentanteForm";
import { FontAwesome5 } from "@expo/vector-icons";
import { font, label } from "../../../../styles";
import Button from "../../../components/ButtonComponent/Button";
import moment from "moment";
import { GetHeader, ToastCall } from "../../../utils/Helpers";
import { HttpService } from "../../../services";
import Select from "../../../components/Select/SelectComponent";
import { Items } from "../../../utils/Interface";
import DatePicker from "react-native-date-picker";
import { useStore } from "../../../context/storeContext/StoreState";
import { useStoreBusiness } from "../../../context/storeBusinessHooks/useStoreBusiness";
import { NavigationScreenNavigationType } from "../../../navigation/StackNavigator";
import Input from "../../../components/InputComponent/Input";
import ScreenContainerForm from "../../../components/ScreenContainerForm";
import { initialProduct, ProductRequest } from "../../../context/storeBusinessHooks/StoreBusinessInterface";
import HeaderApp from "../../../components/HeaderApp";

const ProdutForm = () => {
  const [token, setToken] = useState<string | null>(null);
  const [representatives, setRepresentatives] = useState<any[]>([]);
  const { RepCivil, setRepCivil } = useStoreBusiness();
  const { TokenAuthApi } = useAuth();
  const { setLoader } = useRender();
  const { FormCreateProd, setFormCreateProd, Stores, setStores } = useStoreBusiness();
  const navigation = useNavigation<NavigationScreenNavigationType>();

  const route = useRoute();
  const data = route.params as { Representante: Respresentante } | undefined;
  const [CategoryDataItems, setCategoryDataItems] = useState<Items[]>([
    { label: "Comida", value: "NORMAL" },
    { label: "Regalo", value: "REGALO" },
  ]);


  const change = useCallback(
    (value: string | number, key: keyof ProductRequest) => {
      setFormCreateProd({
        ...FormCreateProd,
        [key]: value,
      });
    },
    [FormCreateProd]
  );

  const sendData = () => {
     navigation.navigate('ProductImg')
  };

  useEffect(() => {
    change(FormCreateProd.amount* 0.16, "iva")
  }, [FormCreateProd.amount])
  

  return (
    <SafeAreaView className=" flex-1 bg-white">
      <ScrollView>
        <HeaderApp title="Crear Producto"/>
        <View className=" flex-1 px-5 w-full bg-white">
          <View className="w-full justify-center items-center mb-2">
            <Input
              labelText="Nombre del Producto"
              placeholder="Perfume"
              keyboardType="default"
              value={FormCreateProd.name}
              maxLength={50}
              onChangeText={(e: string) => change(e, "name")}
            />
          </View>
          <View className="w-full justify-center items-center  ">
            <Input
              labelText="Descripción de Producto"
              placeholder="Un perfume delicioso para la cualquiera..."
              keyboardType="default"
              value={FormCreateProd.description}
              multiline
              maxLength={250}
              onChangeText={(e: string) => change(e, "description")}
            />
          </View>
          {
            <View className="w-full justify-center items-center mb-5 ">
              <Select
                items={CategoryDataItems}
                labelText="Tipo de producto"
                onChange={(e: string | number) => change(e, "aditional2")}
                styleText={{ paddingHorizontal: 0 }}
                value={FormCreateProd.aditional2}
              />
            </View>
          }

          <View className=" flex-row gap-x-3">
            {/* <View className="w-[45%] justify-center items-center mb-2 ">
              <Input
                labelText="Precio"
                placeholder="0"
                keyboardType="numeric"
                value={FormCreateProd.amount.toString()}
                maxLength={50}
                onChangeText={(e: string) => change(e, "amount")}
              />
            </View>
            <View className="w-[45%] justify-center items-center mb-2 ">
              <Input
                labelText="IVA"
                placeholder="0$"
                keyboardType="numeric"
                value={FormCreateProd.iva.toString()}
                maxLength={50}
                disabled={true}
              />
            </View> */}
           {/*  <View className="w-[45%] justify-center items-center mb-2 ">
              <Input
                labelText="IGTF"
                placeholder="0$"
                keyboardType="numeric"
                value={FormCreateProd.igtf.toString()}
                maxLength={50}
                onChangeText={(e: string) => change(e, "igtf")}
                disabled={true}
              />
            </View> */}
          </View>
        </View>
        <View className="w-full flex-row justify-center mt-5  ">
          <View className="w-[50%] items-center">
            <Button
              text={"Siguiente"}
              disabled={ !FormCreateProd.name || !FormCreateProd.description || !FormCreateProd.aditional2}
              onPress={() => sendData()}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProdutForm;
