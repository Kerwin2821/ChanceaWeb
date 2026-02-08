import { View, Text, TouchableOpacity, ScrollView, Platform } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { useIsFocused, useNavigation, useRoute } from "@react-navigation/native";
import { UserData } from "../../context/AuthContext/AuthInterface";
import { Image } from "expo-image";
import { GetHeader } from "../../utils/Helpers";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import {
  Entypo,
  FontAwesome,
  FontAwesome5,
  FontAwesome6,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { font } from "../../../styles";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth, useRender } from "../../context";
import { ListItem } from "@rn-vui/themed";
import Button from "../../components/ButtonComponent/Button";
import { HttpService } from "../../services";
import { useStore } from "../../context/storeContext/StoreState";
import { Colors } from "../../utils";
import Input from "../../components/InputComponent/Input";
import DialogDate from "../../components/Dialog/DialogDate/DialogDate";
import { AxiosError } from "axios";
import { sendNotification } from "../../utils/sendNotification";
import { Product, ProductData } from "../../utils/Date.interface";
import { BottomTabNavigationType } from "../../navigation/BottomTab";
import { Regalo } from "../../utils/Regalos.interface";
import DialogSure from "../../components/Dialog/SureDialog";
import CacheImage from "../../components/CacheImage/CacheImage";

export interface ResponseRegalo {
  codigoRespuesta: string
  mensajeRespuesta: string
  invitations: Regalo
}

const FormRegalos = () => {
  const { BoxPackage, setBoxPackage } = useStore();
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const navigationBottom = useNavigation<BottomTabNavigationType>();
  const [open, setOpen] = useState(false);
  const [openDateAlert, setOpenDateAlert] = useState(false);
  const [openHour, setOpenHour] = useState(false);
  const [DialogActive, setDialogActive] = useState(false);
  const [TextData, setTextData] = useState<string>("");
  const isFocused = useIsFocused();
  const route = useRoute();
  const data = route.params as {
    user: UserData;
  };

  const monto = useMemo(() => {
    if (BoxPackage) {

      return Number(BoxPackage?.amount) - Number(BoxPackage?.iva) - Number(BoxPackage?.igtf);
    }
    return 0
  }, [BoxPackage]);

  const createEvent = async () => {

  };

  /* Cleanup on unmount */
  useEffect(() => {
    return () => {
      setBoxPackage(undefined);
    };
  }, []);


  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-primary mb-4">
        <TouchableOpacity
          className="mr-4"
          onPress={() => navigation.goBack()}
        >
          <FontAwesome6 name="arrow-left" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text className="text-xl text-white" style={font.Bold}>
          Enviar Regalo
        </Text>
      </View>

      <ScrollView className="flex-1 px-4">

        {/* Recipient Section */}
        <View className="items-center mb-6">
          <Text className="text-gray-500 mb-2" style={font.SemiBold}>Para:</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("CustomerProfile", { Customer: data.user, type: "WhoLikeMe" })}
            className="items-center"
          >
            <View className="w-24 h-24 rounded-full border-4 border-white shadow-sm overflow-hidden mb-2">
              <CacheImage
                classNameImage="w-full h-full"
                source={{ uri: data.user.customerProfiles[0].link }}
              />
            </View>
            <Text className="text-xl text-gray-800" style={font.Bold}>
              {data.user.firstName} {data.user.lastName}
            </Text>
            <Text className="text-xs text-secondary" style={font.SemiBold}>Ver perfil</Text>
          </TouchableOpacity>
        </View>

        {/* Gift Selection Section */}
        <View className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <View className="flex-row items-center mb-4">
            <View className="bg-secondary/10 w-8 h-8 rounded-full items-center justify-center mr-2" style={{ backgroundColor: 'rgba(236, 72, 153, 0.1)' }}>
              <Text className="text-secondary font-bold">1</Text>
            </View>
            <Text className="text-lg text-gray-800" style={font.Bold}>
              Elige un detalle
            </Text>
          </View>

          <TouchableOpacity
            className="w-full"
            onPress={() => navigation.navigate("MarketRegalos", { userId: data.user.id })}
          >
            {BoxPackage ? (
              <View className="border-2 border-primary rounded-xl p-4 flex-row items-center bg-primary/5" style={{ borderColor: Colors.primary }}>
                <View className="w-20 h-20 rounded-lg overflow-hidden mr-4 bg-gray-200">
                  <CacheImage
                    source={{ uri: BoxPackage.imagenUrl }}
                    styleImage={{ width: "100%", height: "100%" }}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-lg text-primary mb-1" style={font.Bold} numberOfLines={1}>
                    {BoxPackage.nombre}
                  </Text>
                  <Text className="text-gray-500 text-xs" style={font.SemiBold}>
                    {BoxPackage.typeBox}
                  </Text>
                </View>
                <View className="bg-white p-2 rounded-full border border-gray-100">
                  <FontAwesome5 name="exchange-alt" size={16} color={Colors.primary} />
                </View>
              </View>
            ) : (
              <View className="border-2 border-dashed border-gray-300 rounded-xl h-32 items-center justify-center bg-gray-50">
                <View className="w-12 h-12 bg-white rounded-full items-center justify-center mb-2 shadow-sm">
                  <FontAwesome5 name="gift" size={24} color={Colors.secondary} />
                </View>
                <Text className="text-gray-500" style={font.SemiBold}>
                  Toca para seleccionar un regalo
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Details Section (Conditional) */}
        {BoxPackage && (
          <View className="bg-white rounded-2xl p-4 shadow-sm mb-24">
            <View className="flex-row items-center mb-4">
              <View className="bg-secondary/10 w-8 h-8 rounded-full items-center justify-center mr-2" style={{ backgroundColor: 'rgba(236, 72, 153, 0.1)' }}>
                <Text className="text-secondary font-bold">2</Text>
              </View>
              <Text className="text-lg text-gray-800" style={font.Bold}>
                Personalízalo
              </Text>
            </View>

            <View className="mb-6">
              <View className="flex-row items-center mb-2">
                <Entypo name="chat" size={18} color={Colors.secondary} />
                <Text className="text-gray-700 ml-2" style={font.Bold}>Dedicatoria</Text>
              </View>
              <Input
                value={TextData}
                onChangeText={setTextData}
                placeholder="Escribe un mensaje bonito..."
                multiline
                styleContainer={{ width: "100%", backgroundColor: '#F9FAFB', borderColor: '#E5E7EB', borderRadius: 12 }}
                styleInput={{ width: "100%", height: 100, textAlignVertical: 'top', paddingTop: 10 }}
              />
              <Text className="text-right text-xs text-gray-400 mt-1" style={font.SemiBold}>
                {TextData.length}/150
              </Text>
            </View>

            <View className="border-t border-gray-100 pt-4">
              <Text className="text-gray-700 mb-3" style={font.Bold}>Resumen</Text>

              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-500" style={font.SemiBold}>Subtotal</Text>
                <Text className="text-gray-800" style={font.Bold}>${monto.toFixed(2)}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-500" style={font.SemiBold}>IGTF</Text>
                <Text className="text-gray-800" style={font.Bold}>${BoxPackage.igtf}</Text>
              </View>
              <View className="flex-row justify-between mb-4">
                <Text className="text-gray-500" style={font.SemiBold}>IVA</Text>
                <Text className="text-gray-800" style={font.Bold}>${BoxPackage.iva}</Text>
              </View>

              <View className="flex-row justify-between pt-3 border-t border-gray-200">
                <Text className="text-xl text-primary" style={font.Bold}>Total</Text>
                <Text className="text-xl text-primary" style={font.Bold}>${BoxPackage.amount}</Text>
              </View>
            </View>

            <View className="mt-4 p-3 bg-blue-50 rounded-lg">
              <Text className="text-xs text-blue-600 text-center" style={font.SemiBold}>
                Chancea garantiza la entrega de tu regalo o el reembolso total.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer Action */}
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-lg">
        <Button
          text="Enviar Regalo"
          onPress={() => navigation.navigate("PagoMovilPaymentRegalos", { box: BoxPackage, gif: { customerDestinationId: data.user.id, message: TextData } })}
          disabled={!BoxPackage || !TextData}
          icon={<FontAwesome name="send" size={20} color="white" />}
          showIcon
          IconDirection="left"
        />
      </View>

    </SafeAreaView>
  );
};

export default FormRegalos;

const BoxComposition = ({ BoxId }: { BoxId: number }) => {
  const { TokenAuthApi, SesionToken } = useAuth();
  const [Loading, setLoading] = useState(false);
  const [ProducData, setProducData] = useState<Product[]>([]);

  async function GetBoxProduc() {
    try {
      const host = process.env.APP_BASE_API;
      const url = `/api/api/appchancea/box-package-products/${SesionToken}?boxPackageId.equals=${BoxId}&page=0&size=20`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response: ProductData[] = await HttpService("get", host, url, {}, header);
      setProducData(response.map((e) => e.product));
    } catch (err) {
      const errors = err as AxiosError;

      console.log(errors, "GetRegalos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    GetBoxProduc();
  }, []);
  return (
    <View className=" p-3">
      {ProducData.map((e) => (
        <Text style={[font.Bold]}> ● {e.name}</Text>
      ))}
    </View>
  );
};
