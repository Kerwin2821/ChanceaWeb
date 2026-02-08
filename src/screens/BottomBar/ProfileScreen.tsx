import { View, Text, ScrollView, TouchableOpacity, Pressable, Platform } from "react-native";
import { Chip, Switch } from "@rn-vui/themed";
import { GetHeader, width } from "../../utils/Helpers";
import { useAuth, useRender } from "../../context";
import { Colors } from "../../utils";
import { useRef, useEffect, useState } from "react";
import { AntDesign, FontAwesome6, MaterialIcons, SimpleLineIcons } from "@expo/vector-icons";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import Button from "../../components/ButtonComponent/Button";
import { font } from "../../../styles";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import { Image } from "expo-image";
import { HttpService } from "../../services";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CacheImage from "../../components/CacheImage/CacheImage";
import DialogSelectSource from "../../components/Dialog/DialogSelectSource/DialogSelectSource";
import { Video, ResizeMode } from "expo-av"
import ScreenContainer from "../../components/ScreenContainer";

export default function ProfileScreen() {
  const { user, setUser, TokenAuthApi, SesionToken } = useAuth();
  const { language, setLoader } = useRender();
  const [Edit, setEdit] = useState(false);
  const isFocus = useIsFocused();
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const [Index, setIndex] = useState(0);
  const [Loading, setLoading] = useState(false)
  const [LoadingNick, setLoadingNick] = useState(false)
  const [Csourece, setCsourece] = useState(false)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const videoRef = useRef<Video | null>(null)
  const Next = () => {
    if (user?.customerProfiles && user?.customerProfiles.length - 1 !== Index) setIndex(Index + 1);
    if (user?.customerProfiles && user?.customerProfiles.length - 1 === Index) setIndex(0);
  };

  const Previus = () => {
    if (Index !== 0) setIndex(Index - 1);
  };

  const send = async (check: boolean) => {
    try {
      if (!user) return;

      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/customers/updateShareLocationByCustomerId/${SesionToken}/${check}`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      await HttpService("get", host, url, {}, header, setLoader);

      setUser({ ...user, shareLocation: check });
      await AsyncStorage.setItem("Sesion", JSON.stringify({ ...user, shareLocation: check }));
    } catch (error) {
      console.log(JSON.stringify(error));
    }
  };
  const sameSexChange = async (check: boolean) => {
    try {
      if (!user) return;
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/customers/${SesionToken}`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response = await HttpService("put", host, url, { ...user, sameSex: check }, header, setLoader);

      setUser({ ...user, sameSex: check });
      await AsyncStorage.setItem("Sesion", JSON.stringify({ ...user, sameSex: check }));
    } catch (error) {
      console.log(JSON.stringify(error));
    }
  };
  const pickVideo = async () => {
    try {
      navigation.navigate("VideoEditorDemo");
    } catch (error) {
      console.log("Error al seleccionar video:", error)
    }
  }

  const deleteVideo = async () => {
    setIsVideoPlaying(false)
    try {
      if (!user) return;
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/customers/${SesionToken}`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      await HttpService("put", host, url, { ...user, srcVideo: "" }, header, setLoader);

      setUser({ ...user, srcVideo: "" });
      await AsyncStorage.setItem("Sesion", JSON.stringify({ ...user, srcVideo: "" }));
    } catch (error) {
      console.log(JSON.stringify(error));
    }
  }


  useEffect(() => {
    if (!isFocus) {
      setEdit(false);
    } else {
      setIndex(0)
    }
  }, [isFocus]);

  useEffect(() => {
    if (isFocus) {
      if (!user?.customerSource) {
        setCsourece(true)
      }
    }
  }, [isFocus, user]);

  useEffect(() => {
    setLoading(false)
    setTimeout(() => {
      setLoading(true)
    }, 100);

  }, [Index])

  useEffect(() => {
    setLoadingNick(true)
    setTimeout(() => {
      setLoadingNick(false)
    }, 100);

  }, [user?.nickname])


  return (
    <ScreenContainer backgroundColor={Colors.white} disabledPaddingBottom={true}>
      <View className="flex-row justify-between items-center w-full px-2  h-[8%] bg-white">
        <View className="flex-row justify-between items-center h-8 px-5 w-full">
          <TouchableOpacity onPress={() => navigation.navigate("UserShowProfile")}>
            <SimpleLineIcons name="eye" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("ProfileOptions")}>
            <SimpleLineIcons name="options-vertical" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ backgroundColor: Colors.white }} contentContainerStyle={{ paddingBottom: 64 }}>
        <View className="bg-white ">
          <View className=" flex items-center">
            <View className=" w-full px-4 h-[40vh]" style={{ maxHeight: Platform.OS === 'web' ? 500 : undefined }}>
              <View className=" absolute z-10 top-0 left-0 -rotate-12">
                {user?.verified ? (
                  <Image
                    className=" h-full w-full"
                    style={{ width: 100, height: 100 }}
                    source={require("../../../assets/items/NoFTTrap.png")}
                    transition={{ duration: 300 }}
                  />
                ) : null}
              </View>
              {!Loading || user?.customerProfiles && !user?.customerProfiles.length ? null : (
                <CacheImage
                  classNameImage="absolute top-0 h-full w-full rounded-2xl"
                  source={{ uri: user?.customerProfiles && (user?.customerProfiles as any)[Index]?.link }}
                />
              )}

              <View className=" flex-row h-[20px] p-2 ">
                {user?.customerProfiles &&
                  user?.customerProfiles.map((e, index) => (
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

              <View className=" h-full flex-row">
                <Pressable onPress={Previus} className=" h-full flex-1"></Pressable>
                <Pressable onPress={Next} className=" h-full flex-1"></Pressable>
              </View>

              <TouchableOpacity
                onPress={() => navigation.navigate("PhotoChange", { customerProfile: user?.customerProfiles })}
                className=" p-2 bg-primary rounded-full absolute bottom-4 right-4 shadow-lg "
                style={{ zIndex: 100 }}
              >
                <FontAwesome6 name="pen" size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <View className=" flex-row justify-center mt-3 items-center">
            <Text className=" text-2xl mr-2" style={{ fontFamily: "Bold" }}>
              {" "}
              {user?.firstName + " " + user?.lastName}
            </Text>
            {user?.verified && <AntDesign name="checkcircle" size={24} color="green" />}
          </View>
          <View className=" flex-row justify-center mt-3 items-center">
            <View className=" w-1/2">
              {user?.verified ? (
                <Button
                  text={"Validado"}
                  styleButton={{ backgroundColor: "green" }}
                  styleIcon={{ paddingHorizontal: 12 }}
                  IconDirection="left"
                  showIcon
                  icon={<AntDesign name="checkcircleo" size={24} color="white" />}
                  typeButton="normal"
                />
              ) : (
                <Button
                  text={"Validar"}
                  styleIcon={{ paddingHorizontal: 12 }}
                  IconDirection="left"
                  showIcon
                  icon={<MaterialIcons name="fingerprint" size={24} color={Colors.primary} />}
                  typeButton="white"
                  onPress={() => navigation.navigate("InfoValidateIdentification")}
                />
              )}
            </View>
          </View>
          {
            <View className=" flex-row justify-around items-center mt-3 border border-primary  rounded-xl text-base text-primary ml-1 p-2 w-[95%]">
              <View>
                <Text className=" text-xl " style={{ fontFamily: "Bold" }}>
                  Plan :
                </Text>
                {user?.plan ? (
                  <View className=" pr-2 bg-primary flex justify-center items-center rounded-lg ml-2 pb-1">
                    <Text className=" text-xl text-white " style={{ fontFamily: "Bold" }}>
                      {" "}
                      {user?.plan.name}
                    </Text>
                  </View>
                ) : (
                  <View>
                    <Text className=" text-xl text-primary" style={{ fontFamily: "Bold" }}>
                      {"Gratis"}
                    </Text>
                  </View>
                )}
              </View>
              {!user?.plan ? (
                <View className=" flex items-center w-1/2">
                  <View className=" w-full">
                    <Button
                      text={"¡Recarga!"}
                      typeButton="normal"
                      onPress={() => navigation.navigate("PagoMovilPayment")}
                    />
                  </View>
                </View>
              ) : null}
            </View>
          }
          <View className="bg-white p-2 mt-4 rounded-lg items-start">
            <View className="flex-row items-center mb-2">
              <MaterialIcons name="videocam" size={20} color={Colors.secondary} />
              <Text className="text-base text-secondary ml-2" style={font.Bold}>
                Video de presentación
              </Text>
            </View>

            <View className="border border-primary rounded-xl w-[95%] ml-1 overflow-hidden">
              {user?.srcVideo ? (
                <View className="relative bg-black">
                  <Video
                    ref={videoRef}
                    source={{ uri: user?.srcVideo }}
                    style={{ width: "100%", height: 250 }}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                    isLooping
                    onPlaybackStatusUpdate={(status) => {
                      if (status.isLoaded) {
                        setIsVideoPlaying(status.isPlaying)
                      }
                    }}
                  />
                  <TouchableOpacity
                    className="absolute top-2 right-2 bg-red-500 p-2 rounded-full"
                    onPress={deleteVideo}
                  >
                    <MaterialIcons name="delete" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  className="w-full h-[250px] flex items-center justify-center bg-gray-100"
                  onPress={pickVideo}
                >
                  <MaterialIcons name="video-call" size={64} color={Colors.primary} />
                  <Text className="text-primary mt-2" style={font.SemiBold}>
                    Agregar video de presentación
                  </Text>
                  <Text className="text-gray-500 text-xs mt-1" style={font.Regular}>
                    Máximo 30 segundos
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View className=" bg-white p-2 mt-2 rounded-lg">
            <View className="flex-row items-center">
              <FontAwesome6 name="circle-info" size={18} color={Colors.secondary} />
              <Text className=" text-base text-secondary ml-2" style={font.Bold}>
                ¿Quieres que te vea tu mismo sexo?
              </Text>
            </View>

            <View className=" justify-center items-center pt-2 flex-row gap-x-2 border border-primary  rounded-xl text-base text-primary ml-1 p-2 w-[95%]">
              <TouchableOpacity onPress={() => sameSexChange(false)}>
                <Text
                  style={{ fontFamily: "SemiBold", fontSize: 14 }}
                  className={" w-24 " + (!user?.sameSex ? " text-red-500" : "text-gray-500")}
                >
                  No
                </Text>
              </TouchableOpacity>
              <View className=" w-16 items-center">
                <Switch value={user?.sameSex as boolean} onValueChange={(value) => sameSexChange(value)} />
              </View>
              <TouchableOpacity onPress={() => sameSexChange(true)}>
                <Text
                  style={{ fontFamily: "SemiBold", fontSize: 14 }}
                  className={" w-24 " + (user?.sameSex ? " text-primary" : "text-gray-500")}
                >
                  Si
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View className=" bg-white p-2 mt-2 rounded-lg">
            <View className="flex-row items-center">
              <FontAwesome6 name="circle-info" size={18} color={Colors.secondary} />
              <Text className=" text-base text-secondary ml-2" style={font.Bold}>
                Compartir ubicación
              </Text>
            </View>

            <View className=" justify-center items-center pt-2 flex-row gap-x-2 border border-primary  rounded-xl text-base text-primary ml-1 p-2 w-[95%]">
              <TouchableOpacity onPress={() => send(false)}>
                <Text
                  style={{ fontFamily: "SemiBold", fontSize: 14 }}
                  className={" w-24 " + (!user?.shareLocation ? " text-red-500" : "text-gray-500")}
                >
                  No Compartir
                </Text>
              </TouchableOpacity>
              <View className=" w-16 items-center">
                <Switch value={user?.shareLocation as boolean} onValueChange={(value) => send(value)} />
              </View>
              <TouchableOpacity onPress={() => send(true)}>
                <Text
                  style={{ fontFamily: "SemiBold", fontSize: 14 }}
                  className={" w-24 " + (user?.shareLocation ? " text-primary" : "text-gray-500")}
                >
                  Compartir
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View className=" bg-white p-2 mt-2 rounded-lg items-start">
            <View className="flex-row items-center">
              <FontAwesome6 name="circle-info" size={18} color={Colors.secondary} />
              <Text className=" text-base text-secondary ml-2" style={font.Bold}>
                Acerca de mi
              </Text>
            </View>

            <Text
              className=" border border-primary rounded-xl text-base text-primary ml-1 p-2 w-[95%]"
              style={font.Bold}
            >
              {user?.aboutme}
            </Text>
            <TouchableOpacity
              className=" p-2 bg-primary rounded-full absolute bottom-0 right-2"
              onPress={() => navigation.navigate("AboutMe", { TextData: user?.aboutme })}
            >
              <FontAwesome6 name="pen" size={18} color="white" />
            </TouchableOpacity>
          </View>
          <View className=" bg-white p-2 mt-2 rounded-lg items-start">
            <View className="flex-row items-center">
              <MaterialIcons name="interests" size={18} color={Colors.secondary} />
              <Text className=" text-base text-secondary ml-2" style={font.Bold}>
                Intereses
              </Text>
            </View>

            <View className=" flex-row flex-wrap gap-x-2 border border-primary  rounded-xl text-base text-primary ml-1 p-2 w-[95%] ">
              {user?.customerInterestings.map((e) => (
                <View className=" my-1 " key={e.id}>
                  <Chip title={e.description} iconRight type="outline" titleStyle={[font.Bold, { fontSize: 10 }]} />
                </View>
              ))}
            </View>
            <TouchableOpacity
              className=" p-2 bg-primary rounded-full absolute bottom-0 right-2"
              onPress={() =>
                navigation.navigate("InterestSelect", { customerInterestings: user?.customerInterestings })
              }
            >
              <FontAwesome6 name="pen" size={18} color="white" />
            </TouchableOpacity>
          </View>
          <View className=" bg-white p-2 mt-2 rounded-lg items-start">
            <View className="flex-row items-center">
              <AntDesign name="like1" size={18} color={Colors.secondary} />
              <Text className=" text-base text-secondary ml-2" style={font.Bold}>
                Le gustan personas
              </Text>
            </View>

            <View className=" flex-row flex-wrap gap-x-2 border border-primary  rounded-xl text-base text-primary ml-1 p-2 w-[95%]">
              {user?.customerGoals.map((e) => (
                <View className=" my-1 " key={e.id}>
                  <Chip title={e.description} iconRight type="outline" titleStyle={[font.Bold, { fontSize: 10 }]} />
                </View>
              ))}
            </View>
            <TouchableOpacity
              className=" p-2 bg-primary rounded-full absolute bottom-0 right-2"
              onPress={() => navigation.navigate("Goals", { customerGoals: user?.customerGoals })}
            >
              <FontAwesome6 name="pen" size={18} color="white" />
            </TouchableOpacity>
          </View>

          <View className=" bg-white p-2 mt-2 rounded-lg items-start">
            <View className="flex-row items-center">
              <AntDesign name="star" size={18} color={Colors.secondary} />
              <Text className=" text-base text-secondary ml-2" style={font.Bold}>
                Sobrenombre
              </Text>
            </View>

            <View className=" flex justify-center items-center gap-x-2 border border-primary  rounded-xl text-base text-primary ml-1 p-2 w-[95%]">
              {!LoadingNick && user?.nickname ? (
                <CacheImage
                  source={user?.nickname.url}
                  styleImage={{ height: width * 0.3, width: width * 0.3 }}
                />
              ) : null}
              {user?.nickname ? (
                <View className=" my-1 ">
                  <Chip title={user?.nickname.name} iconRight type="outline" titleStyle={font.Bold} />
                </View>
              ) : null}
            </View>
            <TouchableOpacity
              className=" p-2 bg-primary rounded-full absolute bottom-0 right-2"
              onPress={() => navigation.navigate("NicknameScreen", { Nickname: user?.nickname })}
            >
              <FontAwesome6 name="pen" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        <DialogSelectSource active={Csourece} setActive={setCsourece} />
      </ScrollView>
    </ScreenContainer>
  );
}
