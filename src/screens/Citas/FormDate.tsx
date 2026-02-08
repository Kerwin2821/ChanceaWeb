import { View, Text, TouchableOpacity, ScrollView, Platform } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { UserData } from "../../context/AuthContext/AuthInterface";
import { Image } from "expo-image";
import { GetHeader } from "../../utils/Helpers";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import {
  Entypo,
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
import moment from "moment";
import CustomDatePicker from "../../components/CustomDatePicker";
import Input from "../../components/InputComponent/Input";
import DialogDate from "../../components/Dialog/DialogDate/DialogDate";
import { AxiosError } from "axios";
import { sendNotification } from "../../utils/sendNotification";
import { Cita, Product, ProductData } from "../../utils/Date.interface";
import { BottomTabNavigationType } from "../../navigation/BottomTab";
import DialogSure from "../../components/Dialog/SureDialog";
import CacheImage from "../../components/CacheImage/CacheImage";

export interface ResponseCita {
  codigoRespuesta: string
  mensajeRespuesta: string
  invitations: Cita
}

const FormDate = () => {
  const { user, TokenAuthApi, SesionToken } = useAuth();
  const { setLoader, resetTimer } = useRender();
  const { Citas, setCitas, BoxPackage, setBoxPackage } = useStore();
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const navigationBottom = useNavigation<BottomTabNavigationType>();
  const [DateInit, setDateInit] = useState(new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000));
  const [open, setOpen] = useState(false);
  const [openDateAlert, setOpenDateAlert] = useState(false);
  const [openHour, setOpenHour] = useState(false);
  const [DialogActive, setDialogActive] = useState(false);
  const [TextData, setTextData] = useState<string>("");
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
    setLoader(true);
    try {
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/invitations/appchanceaCreateSingleInvitations/${SesionToken}`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response: ResponseCita = await HttpService(
        "post",
        host,
        url,
        {
          message: TextData,
          dateTimeInvitation: DateInit.toISOString(),
          timePeriod: 1,
          boxPackageId: BoxPackage?.id,
          customerSourceSessionToken: SesionToken,
          customerDestinationId: data.user.id,
        },
        header
      );

      setCitas([response.invitations, ...Citas]);
      setOpenDateAlert(true);
      setTextData("");
      sendNotification(
        user?.firstName.split(" ")[0] + " Te a Invitado a salir.",
        TextData,
        data.user.externalId,
        { sesionToken: SesionToken, TokenApi: TokenAuthApi },
        {
          code: "102",
          citaId: `${response.invitations.id.toString}`,
          name: user?.firstName.split(" ")[0],
          message: TextData,
          urlImage: user?.customerProfiles[0].link,
        }
      );
    } catch (err) {
      const errors = err as AxiosError;

      console.log(errors, "GetCitas");
      console.log(JSON.stringify(errors), "GetCitas");
    } finally {
      setLoader(false);
    }
  };

  useEffect(
    () =>
      navigation.addListener("beforeRemove", (e) => {
        if (BoxPackage) {
          // If we don't have unsaved changes, then we don't need to do anything
          e.preventDefault();
          setDialogActive(true);
          return;
        }

        // Prevent default behavior of leaving the screen

        navigation.dispatch(e.data.action);
      }),
    [navigation, BoxPackage]
  );

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
          Crear Cita
        </Text>
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Recipient Section */}
        <View className="items-center mb-6">
          <Text className="text-gray-500 mb-2" style={font.SemiBold}>Cita con:</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("CustomerProfile", { Customer: data.user, type: "WhoLikeMe", hideActions: true })}
            className="items-center"
          >
            <View className="flex-row items-center justify-center mb-2">
              <View className="w-20 h-20 rounded-full border-4 border-white shadow-sm overflow-hidden z-10">
                <CacheImage
                  classNameImage="w-full h-full"
                  source={{ uri: user?.customerProfiles?.[0]?.link || "" }}
                />
              </View>
              <View className="w-20 h-20 rounded-full border-4 border-white shadow-sm overflow-hidden -ml-6">
                <CacheImage
                  classNameImage="w-full h-full"
                  source={{ uri: data.user.customerProfiles?.[0]?.link || "" }}
                />
              </View>
            </View>
            <Text className="text-xl text-gray-800" style={font.Bold}>
              {data.user.firstName} {data.user.lastName}
            </Text>
            <Text className="text-xs text-secondary" style={font.SemiBold}>Ver perfil</Text>
          </TouchableOpacity>
        </View>

        {/* Step 1: Package Selection */}
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
            onPress={() => navigation.navigate("MarketPaquetes", { userId: data.user.id })}
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
                  <FontAwesome5 name="store" size={24} color={Colors.secondary} />
                </View>
                <Text className="text-gray-500" style={font.SemiBold}>
                  Toca para seleccionar un paquete
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Step 2: Customization */}
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

            {/* Date and Time */}
            <View className="mb-6">
              <View className="flex-row items-center mb-3">
                <MaterialIcons name="calendar-month" size={18} color={Colors.secondary} />
                <Text className="text-gray-700 ml-2" style={font.Bold}>Fecha y Hora</Text>
              </View>
              <View className="flex-row gap-x-2">
                <TouchableOpacity
                  onPress={() => setOpen(true)}
                  className="flex-1 bg-gray-50 p-3 rounded-xl border border-gray-200 items-center"
                >
                  <Text className="text-gray-600 text-xs mb-1" style={font.SemiBold}>Fecha</Text>
                  <Text className="text-gray-800" style={font.Bold}>{moment(DateInit).format("DD/MM/YYYY")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setOpenHour(true)}
                  className="flex-1 bg-gray-50 p-3 rounded-xl border border-gray-200 items-center"
                >
                  <Text className="text-gray-600 text-xs mb-1" style={font.SemiBold}>Hora</Text>
                  <Text className="text-gray-800" style={font.Bold}>{moment(DateInit).format("hh:mm a")}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Message */}
            <View className="mb-6">
              <View className="flex-row items-center mb-2">
                <Entypo name="chat" size={18} color={Colors.secondary} />
                <Text className="text-gray-700 ml-2" style={font.Bold}>Mensaje</Text>
              </View>
              <Input
                value={TextData}
                onChangeText={setTextData}
                placeholder="Escribe algo especial..."
                multiline
                styleContainer={{ width: "100%", backgroundColor: '#F9FAFB', borderColor: '#E5E7EB', borderRadius: 12 }}
                styleInput={{ width: "100%", height: 100, textAlignVertical: 'top', paddingTop: 10 }}
              />
              <Text className="text-right text-xs text-gray-400 mt-1" style={font.SemiBold}>
                {TextData.length}/150
              </Text>
            </View>

            {/* Summary */}
            <View className="border-t border-gray-100 pt-4">
              <Text className="text-gray-700 mb-3" style={font.Bold}>Resumen de Pago</Text>

              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-500" style={font.SemiBold}>Subtotal</Text>
                <Text className="text-gray-800" style={font.Bold}>${monto.toFixed(2)}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-500" style={font.SemiBold}>IGTF (3%)</Text>
                <Text className="text-gray-800" style={font.Bold}>${BoxPackage.igtf}</Text>
              </View>
              <View className="flex-row justify-between mb-4">
                <Text className="text-gray-500" style={font.SemiBold}>IVA (16%)</Text>
                <Text className="text-gray-800" style={font.Bold}>${BoxPackage.iva}</Text>
              </View>

              <View className="flex-row justify-between pt-3 border-t border-gray-200">
                <Text className="text-xl text-primary" style={font.Bold}>Total</Text>
                <Text className="text-xl text-primary" style={font.Bold}>${BoxPackage.amount}</Text>
              </View>
            </View>

            <View className="mt-4 p-3 bg-blue-50 rounded-lg">
              <Text className="text-[10px] text-blue-600 text-center" style={font.SemiBold}>
                Chancea no te cobra hasta que la cita esté confirmada. En caso de cancelación después de la confirmación, se reembolsará el dinero.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer Action */}
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-lg">
        <Button
          text="Invitar"
          onPress={createEvent}
          disabled={!BoxPackage || !TextData}
          icon={<MaterialCommunityIcons name="calendar-heart" size={24} color="white" />}
          showIcon
          IconDirection="left"
        />
      </View>

      <CustomDatePicker
        modal
        theme="light"
        title="Fecha"
        open={open}
        date={DateInit}
        mode="date"
        confirmText="Consultar"
        onConfirm={(date: Date) => {
          setOpen(false);
          setDateInit(date);
        }}
        onCancel={() => {
          setOpen(false);
        }}
      />
      <CustomDatePicker
        modal
        theme="light"
        title="Hora"
        open={openHour}
        date={DateInit}
        mode="time"
        confirmText="Consultar"
        onConfirm={(date: Date) => {
          setOpenHour(false);
          setDateInit(date);
        }}
        onCancel={() => {
          setOpenHour(false);
        }}
      />
      <DialogDate
        active={openDateAlert}
        setActive={setOpenDateAlert}
        data={data.user}
        navigation={navigation}
        navigationBottom={navigationBottom}
      ></DialogDate>
      <DialogSure
        isActive={DialogActive}
        setActive={setDialogActive}
        Text="¿Estas seguro de volver?"
        onPress={() => {
          setBoxPackage(undefined),
            setTimeout(() => {
              navigation.goBack();
            }, 100);
        }}
      />
    </SafeAreaView>
  );
};

export default FormDate;

const BoxComposition = ({ BoxId }: { BoxId: number }) => {
  const { TokenAuthApi, SesionToken } = useAuth();
  const [Loading, setLoading] = useState(false);
  const [ProducData, setProducData] = useState<Product[]>([]);

  async function GetBoxProduc() {
    try {
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/box-package-products/${SesionToken}?boxPackageId.equals=${BoxId}&page=0&size=20`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response: ProductData[] = await HttpService("get", host, url, {}, header);
      console.log(response, "products")
      setProducData(response.map((e) => e.product));
    } catch (err) {
      const errors = err as AxiosError;

      console.log(errors, "GetCitas");
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
