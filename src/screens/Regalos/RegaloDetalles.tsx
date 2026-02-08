import {
  View,
  Text,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  Linking,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useIsFocused, useNavigation, useRoute } from "@react-navigation/native";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import CustomImageViewer from "../../components/CustomImageViewer";
import { Entypo, FontAwesome, FontAwesome5, FontAwesome6, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { font } from "../../../styles";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth, useRender } from "../../context";
import Button from "../../components/ButtonComponent/Button";
import { HttpService } from "../../services";
import { Colors } from "../../utils";
import { CustomerDestination, Estado, Product, ProductData } from "../../utils/Date.interface";
import moment from "moment";
import { GetHeader } from "../../utils/Helpers";
import { AxiosError } from "axios";
import { useStore } from "../../context/storeContext/StoreState";
import { LinearGradient } from "expo-linear-gradient";
import { Skeleton } from "@rn-vui/themed";
import { sendNotification } from "../../utils/sendNotification";
import { UserData } from "../../context/AuthContext/AuthInterface";
import { Image } from "expo-image";
import { useChat } from "../../context/ChatContext/ChatProvider";
import DialogDateAccept from "../../components/Dialog/DialogDateAccept/DialogDateAccept";
import { Regalo, TipoDeRegalo } from "../../utils/Regalos.interface";
import { EstadoRegalos, GiftData } from "./interface.regalos";
import CacheImage from "../../components/CacheImage/CacheImage";
import ScreenContainer from "../../components/ScreenContainer";

const RegaloDetalles = () => {
  const { user, TokenAuthApi, SesionToken } = useAuth();
  const { setLoader } = useRender();
  const { agregarMensajeDesdePerfil } = useChat();
  const { RegalosEnviadas, RegalosRecibidas, setRegalosEnviadas, setRegalosRecibidas, setCustomers, Customers } = useStore();
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const [Index, setIndex] = useState(0);
  const [ShowModal, setShowModal] = useState(false);
  const route = useRoute();
  const data = route.params as {
    data: GiftData;
    tipo: TipoDeRegalo;
  };
  const [Estatus, setEstatus] = useState<EstadoRegalos | undefined>();
  const [visible, setIsVisible] = useState(false);

  const isFocused = useIsFocused();

  /* async function UpdateRegalos(estatus: Estado) {
    setLoader(true);
    try {
      const { id, customerDestination, customerSource } = data.data;
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/appchanceaUpdateInvitationsStatus`;
      const header = await GetHeader(TokenAuthApi, "application/json");

      const response = await HttpService(
        "post",
        host,
        url,
        {
          invitationId: id,
          tokenSessionId: SesionToken,
          acceptanceDate: estatus === "PENDIENTE_DE_PAGO" ? new Date().toISOString() : undefined,
          statusInvitation: estatus,
        },
        header
      );
      setEstatus(estatus);
      NotifiChangeStatusRegalo(
        estatus,
        user,
        user?.id === customerDestination.id ? customerSource : customerDestination,
        data.data,
        SesionToken,
        TokenAuthApi
      );
      if (data.tipo === "RECIBIDA") {
        const host2 = process.env.APP_BASE_API;
        const url2 = `/api/appchancea/createView`;
        const header2 = await GetHeader(TokenAuthApi, "application/json");
        const response2 = await HttpService(
          "post",
          host2,
          url2,
          {
            isChecked: true,
            customerSourceId: SesionToken,
            customerDestionationId: customerDestination.id,
          },
          header2
        );

        setCustomers(Customers.filter((ele) => ele.id !== data.user.id));
        setRegalosRecibidas(
          RegalosRecibidas.map((e) => {
            if (e.id === id) {
              return {
                ...e,
                acceptanceDate: estatus === "PENDIENTE_DE_PAGO" ? new Date().toISOString() : undefined,
                statusInvitation: estatus,
              };
            }
            return e;
          })
        );
      }
      console.log(response);
    } catch (err) {
      const errors = err as AxiosError;

      console.log(errors, "UpdateRegalos");
    } finally {
      setLoader(false);
    }
  } */


  const LikePresseble = () => {
    switch (Estatus) {
      case "PAGADO":
        if (data.tipo === "ENVIADA") {
          return (
            <View className="flex-row justify-center items-center w-full h-10 ">
              <View className=" w-[45%] mr-1">
                <Button text={"Pendiente"} disabled />
              </View>
            </View>
          );
        }
      case "POR_PAGAR":
        if (data.data.customerSource.id === user?.id) {
          return (
            <View className="flex-row  justify-center items-center w-full h-10 ">
              <View className=" w-[45%] mr-1">
                <Button
                  styleButton={{ backgroundColor: Colors.green }}
                  text={"Pagar"}
                  onPress={() => navigation.navigate("PagoMovilPaymentRegalos", { box: data.data.boxPackage, gif: { customerDestinationId: data.data.customerDestination.id, message: data.data.message, gif: data.data } })}
                />
              </View>
            </View>
          );
        } else {
          return (
            <View className="flex-row  justify-center items-center w-full h-10 ">
              <View className=" w-[45%] mr-1">
                <Button text={"Pendiente"} disabled />
              </View>
            </View>
          );
        }

      case "EN_PROCESO":
        return (
          <View className="flex-row  justify-center items-center w-full h-10 ">
            <View className=" w-[45%] mr-1">
              <Button styleButton={{ backgroundColor: Colors.blue }} text={"En Proceso"} disabled />
            </View>
          </View>
        );

      case "CANCELADO":
        return (
          <View className="flex-row  justify-center items-center w-full h-10 ">
            <View className=" w-[45%] mr-1">
              <Button styleButton={{ backgroundColor: Colors.danger }} text={"Cancelada"} disabled />
            </View>
          </View>
        );
      case "ENTREGADO":
        return (
          <View className="flex-row  justify-center items-center w-full h-10 ">
            <View className=" w-[45%] mr-1">
              <Button styleButton={{ backgroundColor: Colors.danger }} text={"Entregado"} disabled />
            </View>
          </View>
        );
      case "ENVIADO":
        return (
          <View className="flex-row  justify-center items-center w-full h-10 ">
            <View className=" w-[45%] mr-1">
              <Button styleButton={{ backgroundColor: Colors.danger }} text={"Enviado"} disabled />
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  useEffect(() => {
    if (isFocused) {
      const Recb = RegalosRecibidas.find((e) => e.id == data.data.id);
      const Envi = RegalosEnviadas.find((e) => e.id == data.data.id);
      if (Recb) {
        setEstatus(Recb.statusGif);
      }
      if (Envi) {
        Envi;
        setEstatus(Envi.statusGif);
      }
    }
  }, [isFocused]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white }}>
      <ScrollView style={{ backgroundColor: Colors.white, flex: 1 }}>
        <View className=" flex-row  justify-start px-2 py-2 bg-primary">
          <TouchableOpacity className=" w-10 flex-row items-center z-10 " onPress={() => navigation.goBack()}>
            <FontAwesome6 name="arrow-left" size={28} color={Colors.white} />
          </TouchableOpacity>

          <View
            className={
              Platform.OS === "ios" ? " gap-x-2 flex-row items-end justify-center w-full" : " gap-x-2 flex-row items-end"
            }
          >
            <Text className=" text-lg text-white w-[85%] text-start" numberOfLines={1} style={font.Bold}>
              {data.tipo === "RECIBIDA"
                ? `${data?.data?.customerSource?.firstName?.split(" ")?.[0] || "Alguien"} te Invito a`
                : `Invitaste a ${data?.data?.customerDestination?.firstName?.split(" ")?.[0] || "alguien"} a`}{" "}
              {data?.data?.storeBusiness?.name || "un lugar"}
            </Text>
          </View>
        </View>

        <View className=" h-[15vh]  justify-center items-center flex-row">
          <View className=" w-1/3 justify-center items-center">
            <Pressable
              className=" w-20 h-20 bg-black rounded-full overflow-hidden"
              onPress={() => {
                navigation.navigate("CustomerProfile", {
                  idCustomer: data.tipo === "ENVIADA" ? data.data.customerDestination.id : data.data.customerSource.id,
                  type: "Piropos",
                  hideActions: true,
                });
              }}
            >
              {data.tipo === "ENVIADA" ? (
                <>
                  <CacheImage
                    source={{ uri: (data?.data?.customerDestination as any)?.customerProfiles?.[0]?.link }}
                    styleImage={{
                      width: "100%",
                      height: "100%",
                    }}

                  />
                </>
              ) : (
                <>
                  <CacheImage
                    source={{ uri: (data?.data?.customerSource as any)?.customerProfiles?.[0]?.link }}
                    styleImage={{
                      width: "100%",
                      height: "100%",
                    }}

                  />
                </>
              )}
            </Pressable>
          </View>
          <View className="w-2/3  ">
            <Text className=" text-base " numberOfLines={1} style={font.Bold}>
              {data.tipo === "RECIBIDA" ? data.data.customerSource.firstName.split(" ")[0] : ""}
              {data.tipo === "RECIBIDA" ? " te dedico" : "Le dedicaste"}
            </Text>
            <Text className=" text-sm " numberOfLines={4} style={font.Regular}>
              {data.data.message}
            </Text>
          </View>
          {/* {CustomerData && !CustomerData.customerProfiles.length ? null : (
                  <Image
                  className="absolute top-0 h-full w-full"
                  source={{ uri: CustomerData && CustomerData.customerProfiles[Index]?.link }}
                  contentFit="cover"
                  />
              )} */}
        </View>
        <View className=" bg-white mt-2 p-2 rounded-lg items-start">
          <View className="flex-row items-center">
            <FontAwesome5 name="hand-holding-heart" size={20} color={Colors.secondary} />
            <Text className=" text-base text-secondary ml-2 capitalize" style={font.Bold}>
              Brindar
            </Text>
          </View>

          <View className=" w-full justify-center items-center">
            <View className=" border border-primary w-[98%] rounded-xl py-2  flex-row">
              <View className=" w-1/3 items-center justify-center ">
                <TouchableOpacity
                  className=" w-24 h-24 bg-black rounded-lg overflow-hidden"
                  onPress={() => setIsVisible(true)}
                >
                  <CacheImage
                    source={{ uri: data.data.boxPackage.imagenUrl }}
                    styleImage={{
                      width: "100%",
                      height: "100%",
                    }}
                  />
                </TouchableOpacity>
              </View>
              <View className="w-2/3  ">
                <Text className=" text-base " numberOfLines={1} style={font.Bold}>
                  {data.data.boxPackage.nombre}
                </Text>
                <BoxComposition BoxId={data.data.boxPackage.id} />
              </View>
            </View>
          </View>
        </View>

        <View className=" absolute bottom-0 bg-transparent flex-row z-10 ">{LikePresseble()}</View>
        {/*TODO */}
        {/*  <DialogDateAccept
          active={ShowModal}
          setActive={setShowModal}
          data={data.tipo === "ENVIADA" ? data.data.customerDestination : data.data.customerSource}
        /> */}
        <View className="flex-row h-[5vh]"></View>
      </ScrollView>
      <CustomImageViewer
        images={[{ uri: data.data.boxPackage.imagenUrl }]}
        imageIndex={0}
        visible={visible}
        onRequestClose={() => setIsVisible(false)}
        FooterComponent={(props: { imageIndex: number }) => (
          <View className="bg-black/50 p-4 items-center">
            <Text className="text-white text-base font-semibold">{data.data.boxPackage.nombre}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default RegaloDetalles;

const BoxComposition = ({ BoxId }: { BoxId: number }) => {
  const { TokenAuthApi, SesionToken } = useAuth();
  const [Loading, setLoading] = useState(false);
  const [ProducData, setProducData] = useState<Product[]>([]);

  async function GetBoxProduc() {
    try {
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/box-package-products/${SesionToken}?boxPackageId.equals=${BoxId}&page=0&size=20&sessionToken=${SesionToken}`;
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

  if (Loading) {
    return (
      <View className=" h-20 justify-center gap-y-1">
        <Skeleton LinearGradientComponent={LinearGradient} animation="wave" width={200} height={20} />
        <Skeleton LinearGradientComponent={LinearGradient} animation="wave" width={150} height={20} />
        <Skeleton LinearGradientComponent={LinearGradient} animation="wave" width={200} height={20} />
      </View>
    );
  }
  return (
    <>
      {ProducData.map((e) => (
        <Text style={[font.Bold]}> ● {e.name}</Text>
      ))}
    </>
  );
};