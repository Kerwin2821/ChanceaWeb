import { View, Text, Pressable, Platform, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { UserData } from "../../context/AuthContext/AuthInterface";
import { Image } from "expo-image";
import { GetHeader, ToastCall, calcularDistancia, encrypt, height, width } from "../../utils/Helpers";
import { LinearGradient } from "expo-linear-gradient";
import ScreenContainer from "../../components/ScreenContainer";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import {
  AntDesign,
  Entypo,
  FontAwesome5,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { font } from "../../../styles";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth, useRender } from "../../context";
import { Chip, FAB } from "@rn-vui/themed";
import Button from "../../components/ButtonComponent/Button";
import { environmet } from "../../../env";
import { HttpService } from "../../services";
import { useChat } from "../../context/ChatContext/ChatProvider";
import { useStore } from "../../context/storeContext/StoreState";
import { Colors } from "../../utils";
import OptionsBaseCustomers from "../../components/OptionsBaseCustomers/OptionsBaseCustomers";
import { getFirstTimeTutoCita, setFirstTimeTutoCita } from "../../services/StoragefirstTimeTutoCita";
import { sendNotification } from "../../utils/sendNotification";
import CacheImageCard from "../../components/CacheImageCard/CacheImageCard";
import { getFirstTimeTutoRegalo } from "../../services/StoragefirstTimeTutoRegalo";
import CachedVideoPlayer from "../../components/VideoCache/CachedVideoPlayer";

const CustomerProfile = () => {
  const { user, TokenAuthApi, SesionToken } = useAuth();
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const { WhoLikeMeList, setWhoLikeMeList, Match, Customers, setCustomers, Customers2, setCustomers2 } = useStore();
  const { agregarMensajeDesdePerfil } = useChat();
  const { setLoader } = useRender();
  const route = useRoute();
  const [CustomerData, setCustomerData] = useState<UserData>();
  const [Index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false)
  const data = route.params as {
    Customer?: UserData;
    idCustomer?: string;
    type: "Match" | "WhoLikeMe" | "Piropos" | "Like" | "NotLike";
    hideActions?: boolean;
  };

  const GoCita = async () => {
    try {
      const storedValue = await getFirstTimeTutoCita();
      const dataCustomer = data.Customer ?? CustomerData

      if (storedValue === null) {
        // Si no existe, lo crea con valor true
        await setFirstTimeTutoCita(true);
        navigation.push("DateTutorial", { user: dataCustomer });
        return;
      }

      navigation.push("FormDate", { user: dataCustomer });
    } catch (error) {
      console.error("Error al validar o crear el valor:", error);
      throw new Error("No se pudo validar o crear el valor.");
    }
  };

  const GoRegalo = async () => {
    try {
      const storedValue = await getFirstTimeTutoRegalo();
      const dataCustomer = data.Customer ?? CustomerData


      navigation.push("FormRegalos", { user: dataCustomer });

    } catch (error) {
      console.error("Error al validar o crear el valor:", error);
      throw new Error("No se pudo validar o crear el valor.");
    }
  };

  const validateMatch = useMemo<boolean>(() => {
    if (!Match) return false
    if (data.Customer) {
      return Match.some((ele) => Number(ele.id) === Number(data.Customer?.id));
    }

    if (data.idCustomer) {
      return Match.some((ele) => Number(ele.id) === Number(data.idCustomer));
    }
    return false;
  }, [Match]);

  const Next = () => {
    if (CustomerData && CustomerData.customerProfiles.length - 1 !== Index) setIndex(Index + 1);
    if (CustomerData && CustomerData.customerProfiles.length - 1 === Index) setIndex(0);
  };

  const Previus = () => {
    if (Index !== 0) setIndex(Index - 1);
  };

  const Like = async () => {
    if (!CustomerData) return;
    try {
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/createView`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response = await HttpService(
        "post",
        host,
        url,
        {
          isChecked: true,
          customerSourceId: SesionToken,
          customerDestionationId: CustomerData.id,
        },
        header
      );

      if (response.codigoRespuesta === "11") {
        navigation.goBack();
        navigation.navigate("MatchModal", { Customer: CustomerData });
        setWhoLikeMeList(WhoLikeMeList.filter((ele) => ele.id !== CustomerData.id));
        sendNotification(
          `Cuadraste con ${user?.firstName.split(" ")[0]} `,
          `Caudrates con ${user?.firstName.split(" ")[0]} ya puedes chancearle. `,
          CustomerData.externalId,
          { sesionToken: SesionToken, TokenApi: TokenAuthApi },
          {
            code: "001",
            CustomerId: user?.id.toString(),
          }
        );
      }
      if (response.codigoRespuesta === "00") {
        navigation.goBack();
        ToastCall("success", `Le has dicho a ${CustomerData.firstName} que te cuadra`, "ES");
        if (Customers.some((ele) => ele.id === CustomerData.id)) {
          setCustomers(Customers.filter((ele) => ele.id !== CustomerData.id));
          setCustomers2(Customers2.filter((ele) => ele.id !== CustomerData.id));
        }
      }
    } catch (err: any) {
      console.error(JSON.stringify(err));
      if (err && err?.status) {
        ToastCall("error", "error de conexión en con el Servidor", "ES");
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES");
      }
    }
  };
  const Dislike = async () => {
    if (!CustomerData) return;
    try {
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/createView`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response = await HttpService(
        "post",
        host,
        url,
        {
          isChecked: false,
          customerSourceId: SesionToken,
          customerDestionationId: CustomerData.id,
        },
        header
      );

      console.log(response.codigoRespuesta);
      const validate = WhoLikeMeList.some((ele) => ele.id === CustomerData.id);

      if (response.codigoRespuesta === "00") {
        navigation.goBack();
        if (validate) {
          setWhoLikeMeList(WhoLikeMeList.filter((ele) => ele.id !== CustomerData.id));
        }
        ToastCall("success", `Le has dicho a ${CustomerData.firstName} que te No te cuadra`, "ES");
        if (Customers.some((ele) => ele.id === CustomerData.id)) {
          setCustomers(Customers.filter((ele) => ele.id !== CustomerData.id));
          setCustomers2(Customers2.filter((ele) => ele.id !== CustomerData.id));
        }
      }
    } catch (err: any) {
      console.error(JSON.stringify(err));
      if (err && err?.status) {
        ToastCall("error", "error de conexión en con el Servidor", "ES");
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES");
      }
    }
  };

  const QueryCustomer = async () => {
    try {
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/customers/${data?.idCustomer}?sessionToken=${SesionToken}`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response = await HttpService("get", host, url, {}, header);
      setCustomerData(response);
    } catch (err: any) {
      console.error(JSON.stringify(err));
      if (err && err?.status) {
        ToastCall("error", "error de conexión en con el Servidor", "ES");
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES");
      }
    }
  };
  const LikePresseble = () => {
    if (!validateMatch) {
      if (data.type === "Like") {
        return null;
      }
      if (data.type === "NotLike") {
        return (
          <View className="flex-row  justify-center items-center w-full h-10 p-2 ">
            <TouchableOpacity
              onPress={() => Like()}
              className="items-center justify-center rounded-full h-16 w-16 bg-black border border-green-600"
            >
              <AntDesign name="heart" size={24} color="white" />
            </TouchableOpacity>
          </View>
        );
      }
      return (
        <View className="flex-row  justify-center items-center w-full h-10 p-2 ">
          <TouchableOpacity
            onPress={() => Dislike()}
            className="items-center justify-center rounded-full h-16 w-16 bg-black border border-red-600 mr-5"
          >
            <Entypo name="cross" size={32} color="#FF5864" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Like()}
            className="items-center justify-center rounded-full h-16 w-16 bg-black border border-green-600"
          >
            <AntDesign name="heart" size={24} color="white" />
          </TouchableOpacity>
        </View>
      );
    } else {
      if (data.hideActions) return null;
      return (
        <View className="flex-row  justify-center items-center w-full">
          <View className=" w-1/2">
            <Button
              text={"Chancear"}
              typeButton="normal"
              styleButton={{ backgroundColor: Colors.secondary }}
              styleText={{ fontSize: 20 }}
              onPress={() => sendMessage(CustomerData)}
            />
          </View>
        </View>
      );
    }
  };

  const sendMessage = async (userPara: UserData | undefined) => {
    if (!userPara) return;
    try {
      setLoader(true);
      agregarMensajeDesdePerfil(userPara, navigation);
    } catch (error) {
    } finally {
      setLoader(false);
    }
  };


  useEffect(() => {

    if (data.Customer) {
      setCustomerData(data.Customer);
    } else {
      QueryCustomer();
    }
  }, []);

  return (
    <ScreenContainer disabledPaddingBottom>
      <View className=" flex-row  justify-start px-2 py-2 bg-primary">
        <TouchableOpacity
          className=" absolute left-3 top-3 flex-row items-center z-10 "
          onPress={() => navigation.goBack()}
        >
          <FontAwesome6 name="arrow-left" size={28} color={Colors.white} />
        </TouchableOpacity>

        <View className={"gap-x-2 flex-row items-end justify-center w-full"}>
          <Text className=" text-lg text-white" style={font.Bold}>
            {CustomerData?.firstName.split(" ")[0]},
          </Text>
          <Text className=" text-2xl text-white" style={font.Regular}>
            {CustomerData && CustomerData.age}
          </Text>
        </View>
        <TouchableOpacity className=" absolute right-3 top-3 flex-row items-center " onPress={() => setIsVisible(true)}>
          <SimpleLineIcons name="options-vertical" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView>
        <View className="h-[60vh]" style={{ maxHeight: Platform.OS === 'web' ? 600 : undefined }}>
          <View className=" flex-row h-[20px] p-2 bg-gray-200">
            {CustomerData &&
              CustomerData.customerProfiles.map((e, index) => (
                <View
                  key={index}
                  className={
                    index === Index
                      ? " flex-1  bg-white rounded-xl mx-1 "
                      : " flex-1  bg-black rounded-xl mx-1 opacity-50 shadow-lg shadow-white "
                  }
                ></View>
              ))}
          </View>



          <View className="  flex-row z-30 absolute top-0 left-0 w-full h-[55vh] ">
            <Pressable onPress={Previus} className=" h-full flex-1"></Pressable>
            <Pressable onPress={Next} className=" h-full flex-1"></Pressable>
          </View>

          {!CustomerData?.customerProfiles.length || !CustomerData.srcVideo ? null :
            !Index ?
              <View style={{ width: "100%", height: "100%", backgroundColor: "black" }}>
                <CachedVideoPlayer
                  url={CustomerData.srcVideo}
                  fileName={CustomerData.srcVideo?.split("/").pop() || ""}
                  isFocus={true} // Passed missing required prop
                />
                {isAnimating && (
                  <View style={{ position: "absolute", top: "50%", left: "50%", transform: [{ translateX: -15 }, { translateY: -15 }] }}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                  </View>
                )}
              </View>
              :
              (
                <CacheImageCard
                  userId={CustomerData.id.toString()}
                  imageUrl={CustomerData.customerProfiles[Index - 1]?.link}
                  styleImage={{ height: "100%", position: "absolute", top: 0, width: "100%" }}
                  containerClassName="h-full w-full"
                />
              )
          }

          {!CustomerData?.customerProfiles.length || CustomerData.srcVideo ? null :
            (
              <CacheImageCard
                userId={CustomerData.id.toString()}
                imageUrl={CustomerData.customerProfiles[Index]?.link}
                styleImage={{ height: "100%", position: "absolute", top: 0, width: "100%" }}
                containerClassName="h-full w-full"
              />
            )
          }

          {!data.hideActions && (
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={{ position: "absolute", bottom: 0, width: "100%", height: "30%", justifyContent: "flex-end", paddingBottom: 10, zIndex: 50 }}
            >
              <View className="flex-row justify-between items-end px-4 w-full mb-2">
                <View className="h-[10vh] w-10 justify-center items-center mb-2">
                  <FAB
                    onPress={GoRegalo}
                    icon={<FontAwesome5 name="hand-holding-heart" size={20} color={Colors.white} />}
                    style={{ backgroundColor: Colors.secondary }}
                  />
                </View>

                <View className="flex-1 items-center justify-end pb-1">
                  {LikePresseble()}
                </View>

                <View className="h-[10vh] w-10 justify-center items-center mb-2">
                  <FAB
                    onPress={GoCita}
                    icon={<MaterialCommunityIcons name="calendar-heart" size={26} color={Colors.white} />}
                    style={{ backgroundColor: Colors.secondary }}
                  />
                </View>
              </View>
            </LinearGradient>
          )}

        </View>
        <View className=" bg-white p-2 mt-2 flex-row rounded-lg items-center">
          <Ionicons name="location-outline" size={18} color={Colors.secondary} />
          <Text className=" text-lg text-secondary ml-2" style={font.Bold}>
            {CustomerData &&
              (!calcularDistancia(
                CustomerData.postionX,
                CustomerData.postionY,
                Number(user?.postionX),
                Number(user?.postionY)
              ) ||
                calcularDistancia(
                  CustomerData.postionX,
                  CustomerData.postionY,
                  Number(user?.postionX),
                  Number(user?.postionY)
                ) <= 1
                ? "Cerca de ti"
                : `A ${calcularDistancia(
                  CustomerData.postionX,
                  CustomerData.postionY,
                  Number(user?.postionX),
                  Number(user?.postionY)
                )} km de distancia`)}
          </Text>
        </View>
        <View className=" bg-white p-2 mt-2 rounded-lg items-start">
          <View className="flex-row items-center">
            <FontAwesome6 name="circle-info" size={18} color={Colors.secondary} />
            <Text className=" text-base text-secondary ml-2" style={font.Bold}>
              Acerca de mi
            </Text>
          </View>

          <Text className=" border border-primary rounded-xl text-base text-primary ml-2 p-2" style={font.Bold}>
            {CustomerData && CustomerData.aboutme}
          </Text>
        </View>
        <View className=" bg-white p-2 mt-2 rounded-lg items-start">
          <View className="flex-row items-center">
            <MaterialIcons name="interests" size={18} color={Colors.secondary} />
            <Text className=" text-base text-secondary ml-2" style={font.Bold}>
              Intereses
            </Text>
          </View>

          <View className=" flex-row flex-wrap gap-x-2">
            {CustomerData &&
              CustomerData.customerInterestings.map((e) => (
                <View className=" my-1 " key={e.id}>
                  <Chip title={e.description} iconRight type="outline" titleStyle={font.Bold} />
                </View>
              ))}
          </View>
        </View>
        <View className=" bg-white p-2 mt-2 rounded-lg items-start">
          <View className="flex-row items-center">
            <AntDesign name="like1" size={18} color={Colors.secondary} />
            <Text className=" text-base text-secondary ml-2" style={font.Bold}>
              Le gustan personas
            </Text>
          </View>

          <View className=" flex-row flex-wrap gap-x-2">
            {CustomerData &&
              CustomerData.customerGoals.map((e) => (
                <View className=" my-1 " key={e.id}>
                  <Chip title={e.description} iconRight type="outline" titleStyle={font.Bold} />
                </View>
              ))}
          </View>
        </View>

        <View className=" bg-white h-[18vh] mt-2 flex-row"></View>
      </ScrollView>
      <OptionsBaseCustomers
        active={isVisible}
        setActive={setIsVisible}
        data={{ idDestino: data.Customer ? (data.Customer.id as number).toString() : "" }}
      />
    </ScreenContainer>
  );
};

export default CustomerProfile;
