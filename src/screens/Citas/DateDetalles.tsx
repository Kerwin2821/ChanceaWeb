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
import { Cita, CustomerDestination, Estado, Product, ProductData, TipoDeCita } from "../../utils/Date.interface";
import moment from "moment";
import { GetHeader } from "../../utils/Helpers";
import { AxiosError } from "axios";
import { useStore } from "../../context/storeContext/StoreState";
import { LinearGradient } from "expo-linear-gradient";
import { sendNotification } from "../../utils/sendNotification";
import { UserData } from "../../context/AuthContext/AuthInterface";
import { Image } from "expo-image";
import { useChat } from "../../context/ChatContext/ChatProvider";
import DialogDateAccept from "../../components/Dialog/DialogDateAccept/DialogDateAccept";
import CacheImage from "../../components/CacheImage/CacheImage";
import ScreenContainer from "../../components/ScreenContainer";

const DateDetalles = () => {
  const { user, TokenAuthApi, SesionToken } = useAuth();
  const { setLoader } = useRender();
  const { agregarMensajeDesdePerfil } = useChat();
  const { CitasEnviadas, CitasRecibidas, setCitasEnviadas, setCitasRecibidas, setCustomers, Customers } = useStore();
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const [Index, setIndex] = useState(0);
  const [ShowModal, setShowModal] = useState(false);
  const route = useRoute();
  const data = route.params as {
    data: Cita;
    tipo: TipoDeCita;
  };
  const [Estatus, setEstatus] = useState<Estado | undefined>();
  const [visible, setIsVisible] = useState(false);

  const isFocused = useIsFocused();

  async function UpdateCitas(estatus: Estado) {
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
      NotifiChangeStatusCita(
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

        const otherPerson = data.data.customerSource;
        setCustomers(Customers.filter((ele) => ele.id !== otherPerson.id));
        setCitasRecibidas(
          CitasRecibidas.map((e) => {
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

      console.log(errors, "UpdateCitas");
    } finally {
      setLoader(false);
    }
  }


  const LikePresseble = () => {
    switch (Estatus) {
      case "ENVIADA":
        if (data.tipo === "ENVIADA") {
          return (
            <View className="flex-row justify-center items-center w-full h-10 ">
              <View className=" w-[45%] mr-1">
                <Button text={"Pendiente"} disabled />
              </View>
            </View>
          );
        } else {
          return (
            <View className="flex-row  justify-center items-center w-full h-10 ">
              <View className=" w-[45%] mr-1">
                <Button
                  showIcon
                  icon={<FontAwesome name="close" size={24} color="white" />}
                  IconDirection="left"
                  styleButton={{ backgroundColor: "#FF5864" }}
                  text={"No, gracias."}
                  onPress={() => UpdateCitas("RECHAZADA")}
                />
              </View>
              <View className=" w-[45%] ml-1">
                <Button
                  showIcon
                  icon={<Entypo name="check" size={24} color="white" />}
                  IconDirection="left"
                  styleButton={{ backgroundColor: Colors.green }}
                  text={"Sí, quiero."}
                  onPress={() => {
                    setShowModal(true);
                    UpdateCitas("PENDIENTE_DE_PAGO");
                  }}
                />
              </View>
            </View>
          );
        }
      case "PENDIENTE_DE_PAGO":
        if (data.tipo === "ENVIADA") {
          return (
            <View className="flex-row  justify-center items-center w-full h-10 ">
              <View className=" w-[45%] mr-1">
                <Button
                  styleButton={{ backgroundColor: Colors.green }}
                  text={"Pagar"}
                  onPress={() => navigation.navigate("PagoMovilPaymentCitas", data.data)}
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

      case "ACEPTADA":
        return (
          <View className="flex-row  justify-center items-center w-full h-10 ">
            <View className=" w-[45%] mr-1">
              <Button
                styleButton={{ backgroundColor: Colors.secondary }}
                text={"Chancear"}
                onPress={() =>
                  agregarMensajeDesdePerfil(
                    (data.tipo === "ENVIADA" ? data.data.customerDestination : data.data.customerSource) as any,
                    navigation
                  )
                }
              />
            </View>
          </View>
        );

      case "EN_PROCESO":
        return (
          <View className="flex-row  justify-center items-center w-full h-10 ">
            <View className=" w-[45%] mr-1">
              <Button styleButton={{ backgroundColor: Colors.blue }} text={"En Proceso"} disabled />
            </View>
          </View>
        );

      case "FINALIZADA":
        return (
          <View className="flex-row  justify-center items-center w-full h-10 ">
            <View className=" w-[45%] mr-1">
              <Button text={"Pendiente"} styleButton={{ backgroundColor: Colors.green }} disabled />
            </View>
          </View>
        );
      case "VENCIDA":
        return (
          <View className="flex-row  justify-center items-center w-full h-10 ">
            <View className=" w-[45%] mr-1">
              <Button styleButton={{ backgroundColor: Colors.grayDark }} text={"Vencida"} disabled />
            </View>
          </View>
        );

      case "CANCELADA":
        return (
          <View className="flex-row  justify-center items-center w-full h-10 ">
            <View className=" w-[45%] mr-1">
              <Button styleButton={{ backgroundColor: Colors.danger }} text={"Cancelada"} disabled />
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  useEffect(() => {
    if (isFocused) {
      const Recb = CitasRecibidas.find((e) => e.id == data.data.id);
      const Envi = CitasEnviadas.find((e) => e.id == data.data.id);
      if (Recb) {
        setEstatus(Recb.statusInvitation);
      }
      if (Envi) {
        Envi;
        setEstatus(Envi.statusInvitation);
      }
    }
  }, [isFocused]);
  useEffect(() => {
    if (isFocused) {
      console.log((data.data.boxPackage as any).storeBusiness)
    }
  }, [isFocused]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white }}>
      <ScrollView >
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
                ? `${data.data.customerSource.firstName.split(" ")[0]} te Invito a`
                : `Invitaste a ${data.data.customerDestination.firstName.split(" ")[0]} a`}{" "}
              {(data.data.boxPackage as any).storeBusiness?.name}
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
                    source={{ uri: (data.data.customerDestination as any).customerProfiles[0].link }}
                    styleImage={{
                      width: "100%",
                      height: "100%",
                    }}

                  />
                </>
              ) : (
                <>
                  <CacheImage
                    source={{ uri: (data.data.customerSource as any).customerProfiles[0].link }}
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
              {data.tipo === "RECIBIDA" ? " te dice" : "Le dijiste"}
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
            <MaterialIcons name="dinner-dining" size={24} color={Colors.secondary} />
            <Text className=" text-base text-secondary ml-2 capitalize" style={font.Bold}>
              {data.data.boxPackage.typeBox}
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
        <View className=" bg-white p-2 rounded-lg items-start">
          <View className="flex-row items-center">
            <MaterialIcons name="calendar-month" size={24} color={Colors.secondary} />
            <Text className=" text-base text-secondary ml-2" style={font.Bold}>
              Fecha
            </Text>
          </View>

          <View className=" w-full justify-center items-center">
            <Button
              disabled
              styleButton={{ borderWidth: 2, backgroundColor: Colors.white, borderColor: Colors.primary }}
              styleText={{ color: "#000" }}
              text={moment(data.data.dateTimeInvitation).format("DD/MM/YY  hh:mm a ")}
            />
          </View>
        </View>

        <View className=" absolute bottom-0 bg-transparent flex-row z-10 ">{LikePresseble()}</View>

        <DialogDateAccept
          active={ShowModal}
          setActive={setShowModal}
          data={(data.tipo === "ENVIADA" ? data.data.customerDestination : data.data.customerSource) as any}
        />
        <View className="flex-row h-[5vh]"></View>
      </ScrollView>
      <CustomImageViewer
        images={[{ uri: data.data.boxPackage.imagenUrl }]}
        imageIndex={0}
        visible={visible}
        onRequestClose={() => setIsVisible(false)}
        FooterComponent={(props: { imageIndex: number }) => (
          <View className="bg-black/50 p-4 items-center">
            <Text className="text-white text-base font-semibold">{(data.data.boxPackage as any).nombre}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default DateDetalles;

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

      console.log(errors, "GetCitas");
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
        {/*  <Skeleton LinearGradientComponent={LinearGradient} animation="wave" width={200} height={20} />
        <Skeleton LinearGradientComponent={LinearGradient} animation="wave" width={150} height={20} />
        <Skeleton LinearGradientComponent={LinearGradient} animation="wave" width={200} height={20} /> */}
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

const NotifiChangeStatusCita = (
  Estatus: Estado,
  user: UserData | null,
  userDestination: UserData | CustomerDestination,
  cita: Cita,
  sesionToken: string,
  TokenAuthApi: string
) => {
  let titulo: string;
  let texto: string;

  switch (Estatus) {
    case "ENVIADA":
      titulo = `Cita Enviada`;
      texto = `${user?.firstName.split(" ")[0]} ha enviado una solicitud de cita.`;
      break;
    case "ACEPTADA":
      titulo = `Ha ${user?.firstName.split(" ")[0]} Aceptado tu Cita`;
      texto = `${user?.firstName.split(" ")[0]} ha aceptado la cita.`;
      break;
    case "FINALIZADA":
      titulo = `Ha ${user?.firstName.split(" ")[0]} Finalizado tu Cita`;
      texto = `${user?.firstName.split(" ")[0]} ha finalizado la cita.`;
      break;
    case "PENDIENTE_DE_PAGO":
      titulo = `Ha ${user?.firstName.split(" ")[0]} Aceptada tu Cita `;
      texto = `${user?.firstName.split(" ")[0]} tiene una cita pendiente de pago.`;
      break;
    case "VENCIDA":
      titulo = `Tu Cita con ${user?.firstName.split(" ")[0]} a Vencido`;
      texto = `${user?.firstName.split(" ")[0]} no asistió, la cita ha vencido.`;
      break;
    case "CANCELADA":
      titulo = `Tu Cita con ${user?.firstName.split(" ")[0]} se a Cancelado`;
      texto = `${user?.firstName.split(" ")[0]} ha cancelado la cita.`;
      break;
    case "EN_PROCESO":
      titulo = `Cita en Proceso`;
      texto = `${user?.firstName.split(" ")[0]} está en proceso con la cita.`;
      break;
    case "RECHAZADA":
      titulo = `Ha ${user?.firstName.split(" ")[0]} Rechazada tu Cita`;
      texto = `${user?.firstName.split(" ")[0]} rechazado la cita.`;
      break;
    default:
      titulo = `Estado Desconocido`;
      texto = `Estado de cita no reconocido.`;
  }

  sendNotification(
    titulo,
    texto,
    (userDestination as any).externalId,
    { sesionToken, TokenApi: TokenAuthApi },
    {
      code: "102",
      citaId: `${cita.id.toString()}`,
      name: user?.firstName.split(" ")[0],
      message: texto,
      urlImage: (user?.customerProfiles as any)?.[0]?.link,
    }
  );
};
