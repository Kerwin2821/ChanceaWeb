import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Platform
} from "react-native";
import { MutableRefObject, useMemo, useState } from "react";
import { CustomersHome } from "../../utils/Interface";
import { LinearGradient } from "expo-linear-gradient";
import {
  AntDesign,
  Entypo,
  FontAwesome5,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { calcularDistancia, height, width } from "../../utils/Helpers";
import { useAuth, useRender, useStore } from "../../context";
import { Colors } from "../../utils";
import { Image } from "expo-image";
import { Path, Svg } from "react-native-svg";
import { Button } from '@rn-vui/themed';
import { font } from "../../../styles";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import { useNavigation } from "@react-navigation/native";
import CopilotStepComponent from "../CopilotStep/CopilotStepComponent";
import { getFirstTimeTutoCita, setFirstTimeTutoCita } from "../../services/StoragefirstTimeTutoCita";
import { getFirstTimeTutoRegalo } from "../../services/StoragefirstTimeTutoRegalo";
import CacheImageCard from "../CacheImageCard/CacheImageCard";
import CacheImage from "../CacheImage/CacheImage";
import { ResizeMode, Video } from "expo-av";
import CachedVideoPlayer from "../VideoCache/CachedVideoPlayer";

const CardComponent = ({
  index,
  card,
  SwiperRef,
  selectCustomer,
  focusCard,
  showUserProfile = false
}: {
  index: number;
  card: CustomersHome;
  SwiperRef: MutableRefObject<any>;
  selectCustomer: (e: CustomersHome, type: "Piropos" | "AstrologyC" | "Denuncia") => void;
  focusCard: boolean;
  showUserProfile?: boolean;
}) => {
  const { DataCoordenadas } = useAuth();
  const { soundVideo, setSoundVideo, playVideo } = useRender();
  const { PhotoIndexes, setPhotoIndex } = useStore();

  // Use global index if available, otherwise default to 0
  const Index = PhotoIndexes[card.id.toString()] || 0;

  const navigation = useNavigation<NavigationScreenNavigationType>();
  const [isAnimating, setIsAnimating] = useState(false)

  const distance = useMemo(() => {
    const distanceCAL = calcularDistancia(
      DataCoordenadas.coords.longitude,
      DataCoordenadas.coords.latitude,
      Number(card.postionX),
      Number(card.postionY)
    );
    return distanceCAL;
  }, [DataCoordenadas]);

  const Next = () => {
    if (card.srcVideo) {
      if (card.customerProfiles.length !== Index) setPhotoIndex(card.id.toString(), Index + 1);
    } else {
      if (card.customerProfiles.length - 1 !== Index) setPhotoIndex(card.id.toString(), Index + 1);
    }
  };

  const Previus = () => {
    if (Index !== 0) setPhotoIndex(card.id.toString(), Index - 1);
  };

  const GoCita = async () => {
    try {
      const storedValue = await getFirstTimeTutoCita();

      /* if (storedValue === null) {
        // Si no existe, lo crea con valor true
        await setFirstTimeTutoCita(true);
        navigation.navigate("DateTutorial", { user: card });
        return;
      } */

      navigation.navigate("FormDate", { user: card });
    } catch (error) {
      console.error("Error al validar o crear el valor:", error);
      throw new Error("No se pudo validar o crear el valor.");
    }
  };
  const GoRegalo = async () => {
    try {
      const storedValue = await getFirstTimeTutoRegalo();

      /* if (storedValue === null) {
        // Si no existe, lo crea con valor true
        await setFirstTimeTutoRegalo(true);
        navigation.push("RegalosTutorial", { user: card });
        return;
      } */

      navigation.push("FormRegalos", { user: card });
    } catch (error) {
      console.error("Error al validar o crear el valor:", error);
      throw new Error("No se pudo validar o crear el valor.");
    }
  };

  const renderContent = () => {
    const hasVideo = !!card.srcVideo;
    const profiles = card.customerProfiles || [];

    return (
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%" }}>
        {/* Render Video as the first layer if it exists */}
        {hasVideo && (
          <View
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              opacity: Index === 0 ? 1 : 0,
              zIndex: Index === 0 ? 10 : 0
            }}
            pointerEvents={Index === 0 ? 'auto' : 'none'}
          >
            <CachedVideoPlayer
              url={card.srcVideo}
              fileName={card.srcVideo?.split("/").pop() || ""}
              isFocus={focusCard && playVideo && Index === 0}
            />
            {isAnimating && (
              <View style={{ position: "absolute", top: "50%", left: "50%", transform: [{ translateX: -15 }, { translateY: -15 }] }}>
                <ActivityIndicator size="large" color={Colors.primary} />
              </View>
            )}
          </View>
        )}

        {/* Render all Profile Images */}
        {profiles.map((profile, idx) => {
          // Adjust index based on whether there's a video
          const viewIndex = hasVideo ? idx + 1 : idx;
          const isVisible = Index === viewIndex;

          return (
            <View
              key={profile.id || idx}
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                top: 0,
                left: 0,
                opacity: isVisible ? 1 : 0,
                zIndex: isVisible ? 10 : 0
              }}
              pointerEvents={isVisible ? 'auto' : 'none'}
            >
              <CacheImageCard
                userId={card.id.toString()}
                imageUrl={profile.link}
                styleImage={{ height: "100%", width: "100%" }}
                containerClassName="h-full w-full"
              />
            </View>
          );
        })}
      </View>
    );
  };

  if (!card) {
    return;
  }

  return (
    <View
      key={card.id}
      className={"relative  bg-black flex-1"}
      style={{ height: "100%", flex: 1 }}
    >
      <View className="absolute h-full w-full pointer-events-none justify-center">
        <ActivityIndicator size={64} color={Colors.primary} />
      </View>
      {card.verified ? (
        <View
          className={
            "absolute z-10 top-2 left-0 -rotate-12"
          }
        >
          <Image
            className=" h-full w-full"
            style={{ width: 100, height: 100 }}
            source={require("../../../assets/items/NoFTTrap.png")}

          />
        </View>
      ) : null}
      <View className={"absolute z-50 top-5 right-2 w-full"}>
        <View className="flex-row w-full justify-between pl-4 ">

          {!card.customerProfiles.length || !card.srcVideo ? <View></View> :
            !Index ?
              <TouchableOpacity className=" p-3  " onPress={() => setSoundVideo(!soundVideo)}>
                {soundVideo
                  ?
                  <SimpleLineIcons name="volume-2" size={24} color={Colors.white} />
                  :
                  <SimpleLineIcons name="volume-off" size={24} color={Colors.white} />
                }
              </TouchableOpacity>
              :
              <View></View>
          }



          <TouchableOpacity className=" p-3  " onPress={() => selectCustomer(card, "Denuncia")}>
            <SimpleLineIcons name="options-vertical" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>
        <CopilotStepComponent message="Cantidad de Cuadres que tiene el cuadre." step={7} name="CantLike">
          {card.quantityLike ? (
            <View className=" p-2 items-center rounded-xl w-1/4 self-end " style={{ backgroundColor: "rgba(255, 255, 255, 0.6)" }}>
              <Text style={[font.Bold, { fontSize: 20 }]}>
                <AntDesign name="heart" size={16} color={Colors.secondary} />
                {card.quantityLike}
              </Text>
              <Text style={[font.Bold, { fontSize: 12, marginRight: 5 }]}>Me gusta</Text>
            </View>
          ) : null}
        </CopilotStepComponent>
      </View>
      <View className="absolute top-0 w-full z-30 flex-row h-[3%] p-2 rounded-t-2xl bg-transparent ">
        {card.customerProfiles.length > 0 &&
          Array.from({ length: card.srcVideo ? card.customerProfiles.length + 1 : card.customerProfiles.length }).map((_, index) => (
            <View
              key={index}
              className={`flex-1 rounded-xl mx-1 ${index === Index ? "bg-gray-200" : "bg-gray-400 opacity-50"
                }`}
            />
          ))}
      </View>

      <View className="  flex-row z-30 absolute top-0 left-0 w-full h-full ">
        <Pressable onPress={Previus} className=" h-full flex-1"></Pressable>
        <Pressable onPress={Next} className=" h-full flex-1"></Pressable>
      </View>

      {renderContent()}




      <LinearGradient
        colors={[
          "transparent",
          "rgba(0,0,0,0.1)",
          "rgba(0,0,0,0.3)",
          "rgba(0,0,0,0.5)",
          "rgba(0,0,0,0.7)",
          "rgba(0,0,0,0.8)",
          "rgba(0,0,0,0.8)",
        ]}
        className="flex justify-end pb-6 absolute bottom-0 w-full bg-transparent rounded-br-2xl rounded-bl-2xl px-4 z-50 "
        style={{ position: "absolute", width: "100%", backgroundColor: "transparent", bottom: 0, height: '40%', paddingHorizontal: 16 }}
      >
        <View className="w-full mb-4">
          <CopilotStepComponent
            message="Datos del cuadre, aquí puedes encontrar el nombre, el signo, la edad y a que distancia esta de ti."
            step={6}
            name="DatosdeCuadre"
          >
            <View className="flex-row items-center pr-2 mb-2">
              <View className="mr-3 shrink">
                <View className="flex-row items-baseline flex-wrap">
                  <Text className="text-2xl font-bold text-white shadow-sm mr-2">
                    {card.firstName.slice(0, 10)}, {card.age}
                  </Text>

                </View>

                {card?.nickname && (
                  <Text className="text-base font-semibold text-white shadow-sm opacity-90 mb-1">
                    {card?.nickname.description}
                  </Text>
                )}

                <View className="flex-row items-center mt-1">
                  <FontAwesome5 name="map-marker-alt" size={12} color="white" />
                  <Text className="text-sm text-white ml-2 font-medium shadow-sm">
                    {distance > 5 ? `${distance} km` : "Cerca de ti"}
                  </Text>
                </View>
              </View>

              {card?.nickname ? (
                <View>
                  <CacheImage
                    source={card?.nickname.url}
                    styleImage={{
                      height: Platform.OS === 'web' ? 80 : width * 0.15,
                      width: Platform.OS === 'web' ? 80 : width * 0.15,
                    }}
                  />
                </View>
              ) : null}
            </View>
          </CopilotStepComponent>
        </View>

        <View className=" flex flex-row justify-evenly items-center  ">
          <View className="h-14 w-14">
            <CopilotStepComponent
              message="En este botón podrás ir la pantalla de Ubicación y ver si la persona que te gusta esta cerca."
              step={5}
              name="Ubicación"
            >
              <TouchableOpacity
                onPress={() => navigation.navigate("MapasScreen", { Customer: card })}
                disabled={!card.shareLocation || showUserProfile}
                className={
                  "items-center justify-center rounded-full h-12 w-12 shadow-lg " +
                  (card.shareLocation ? "bg-orange-500 shadow-orange-500/40" : "bg-zinc-700 shadow-black/40")
                }
              >
                {/* <ChanceaIcon size={28} color="white" /> */}
                <FontAwesome6 name="location-dot" size={22} color="white" />
              </TouchableOpacity>
            </CopilotStepComponent>
          </View>

          <View className="h-16 w-16">
            <CopilotStepComponent
              message="Este botón es usado para identificar que la persona que estas viendo no te cuadra"
              step={2}
              name="Dislike"
            >
              <View className=" items-center justify-center" >
                {/* <Button
                  children={<Entypo name="cross" size={32} color="#FF5864" />}
                  style={{
                    backgroundColor: "black",
                    borderRadius: 100,
                    paddingVertical: 10,
                    width: 64,
                    height: 64,
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: "absolute",
                    borderWidth: 2,
                    borderColor: "#FF5864",
                  }}
                  onPress={() => {
                    SwiperRef.current.swipeLeft();
                  }}
                /> */}

                <TouchableOpacity
                  onPress={() => {
                    setIsAnimating(true);
                    SwiperRef.current.swipeLeft()
                    setTimeout(() => {
                      setIsAnimating(false);
                    }, 350);
                  }
                  }
                  className="items-center justify-center rounded-full h-16 w-16 bg-red-500 shadow-lg shadow-red-500/50"
                  disabled={showUserProfile}
                >
                  <Entypo name="cross" size={36} color="white" />

                </TouchableOpacity>

                {/* <Button
                  children={<Entypo name="cross" size={32} color="#FF5864" />}
                  buttonStyle={{
                    backgroundColor: "black",
                    borderRadius: 100,
                    paddingVertical: 10,
                    width: 60,
                    height: 60,
                    position: "absolute",
                    top: "3%",
                    left: "3%",
                     borderWidth: 2,
                    borderColor: "#FF5864",
                  }}
                  containerStyle={{
                    width: 64,
                    height: 64,
                  }}
                  onPress={() =>  SwiperRef.current.swipeLeft()}
                /> */}
              </View>
            </CopilotStepComponent>
          </View>

          <View className="h-16 w-16">
            <CopilotStepComponent
              message="Este botón es usado para identificar que la persona que estas viendo te cuadra."
              step={1}
              name="Like"
            >
              <View className=" items-center justify-center">
                {/*  <Button
                  children={<AntDesign name="heart" size={22} color="white" />}
                  style={{
                    backgroundColor: "black",
                    borderRadius: 100,
                    paddingVertical: 10,
                    width: 64,
                    height: 64,
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: "absolute",
                    borderWidth: 2,
                    borderColor: Colors.green,
                  }}

                  onPress={() => {
                    SwiperRef.current.swipeRight();
                  }}
                /> */}
                <TouchableOpacity onPress={() => {
                  setIsAnimating(true);
                  SwiperRef.current.swipeRight()
                  setTimeout(() => {
                    setIsAnimating(false);
                  }, 350);

                }
                }
                  disabled={showUserProfile}
                  className="items-center justify-center rounded-full h-16 w-16 bg-green-500 shadow-lg shadow-green-500/50">
                  <AntDesign name="heart" size={32} color={Colors.white} />
                </TouchableOpacity>
                {/* <Button
                  children={<AntDesign name="heart" size={24} color="white" />}
                  buttonStyle={{
                    backgroundColor: "black",
                    borderRadius: 100,
                    paddingVertical: 10,
                    width: 60,
                    height: 60,
                    position: "absolute",
                    top: "3%",
                    left: "3%",
                    borderWidth: 2,
                    borderColor: Colors.green,
                  }}
                  containerStyle={{
                    width: 64,
                    height: 64,
                  }}
                  onPress={() => {
                      SwiperRef.current.swipeRight();
           
                  }}
                /> */}
              </View>
            </CopilotStepComponent>
          </View>

          <View className="h-10 w-10 absolute -top-24 right-0">
            <TouchableOpacity
              onPress={GoRegalo}
              className="items-center justify-center rounded-full h-10 w-10 bg-black border border-purple-600"
              disabled={showUserProfile}
            >
              <FontAwesome5 name="hand-holding-heart" size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>


          <View className="h-10 w-10 absolute -top-12 right-0">
            <TouchableOpacity
              onPress={GoCita}
              className="items-center justify-center rounded-full h-10 w-10 bg-black border border-purple-600"
              disabled={showUserProfile}
            >
              <MaterialCommunityIcons name="calendar-heart" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
          <View className="h-14 w-14">
            <CopilotStepComponent
              message="Al darle tap a este botón podrás enviarle un piropo a la persona que te gusta."
              step={3}
              name="Piropos"
            >
              <TouchableOpacity
                onPress={() => selectCustomer(card, "Piropos")}
                className="items-center justify-center rounded-full h-12 w-12 bg-purple-600 shadow-lg shadow-purple-600/40"
                disabled={showUserProfile}
              >
                <ChanceaIcon size={24} color="white" />
              </TouchableOpacity>
            </CopilotStepComponent>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

function ChanceaIcon(props: any) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size}
      height={props.size}
      viewBox="0 0 143 122"
      fill="none"
      className="-z-10"
      {...props}
    >
      <Path
        d="M30.761 7.323l97.048 11.362c3.07 2.864 5.843 4.959 7.555 7.172a11.12 11.12 0 012.185 8.383l-9.032 61.568c-.885 6.082-6.523 10.271-12.604 9.386l-27.744-4.073a3.573 3.573 0 00-3.07 1.004l-18.15 17.887a3.647 3.647 0 01-4.96.148c-.295-.267-6.402-5.727-6.612-6.11l-6.436-17.209a3.694 3.694 0 00-2.658-1.86L18.54 90.907a11.237 11.237 0 01-5.255-2.242c-.679-.531-8.826-6.938-9.592-9.975l14.493-61.952c.885-6.081 6.522-10.3 12.575-9.415z"
        fill="#DFC5FC"
      />
      <Path
        d="M16.247 32.156C-4.108 27.042-.832 10.342 2.426 1.682 3.159-.265 5.79-.611 6.95 1.115c3.207 4.77 8.974 8.249 13.312 10.35 5.23 2.532 9.17 7.213 10.538 12.857 1.43 5.894-.332 11.409-14.558 7.834h.004zM117.469 46.078c20.6 4.001 24.721-12.507 25.443-21.734.163-2.077-2.073-3.507-3.857-2.434-4.926 2.961-11.625 3.662-16.447 3.723-5.811.072-11.361 2.64-14.998 7.172-3.796 4.731-4.54 10.474 9.859 13.273z"
        fill={true ? Colors.primary : Colors.graySemiDark}
      />
      <Path
        d="M24.416 1.48l97.401 14.287c6.082.884 10.271 6.522 9.387 12.604l-9.033 61.597c-.884 6.082-6.522 10.271-12.604 9.386l-27.743-4.073a3.576 3.576 0 00-3.07 1.004l-18.151 17.887c-1.712 1.683-4.576 1.268-5.757-.856l-12.25-22.344a3.694 3.694 0 00-2.658-1.86L12.195 85.04c-6.082-.885-10.271-6.523-9.387-12.605l9.033-61.597c.856-6.05 6.493-10.242 12.575-9.357z"
        fill={true ? Colors.primary : Colors.graySemiDark}
      />
      <Path
        d="M62.788 36.515c3.189.473 4.547 2.065 5.991 4.427 2.066-1.83 3.807-2.98 6.996-2.539.411.058.827.148 1.267.268 2.716.679 5.547 3.69 5.226 8.588l-.235 1.621c-.986 4.392-5.002 9.343-15.171 14.735a2.372 2.372 0 01-2.778-.408c-8.209-8.086-10.61-13.984-10.329-18.458l.235-1.622c1.09-4.81 4.663-6.876 7.498-6.728.473 0 .885.058 1.3.12M25.98 32.618c3.189.473 4.546 2.066 5.991 4.428 2.066-1.831 3.807-2.98 6.996-2.54.411.059.827.149 1.267.268 2.716.68 5.547 3.691 5.226 8.588l-.235 1.622c-.986 4.391-5.002 9.343-15.172 14.735a2.373 2.373 0 01-2.777-.409c-8.209-8.086-10.61-13.983-10.329-18.458l.235-1.621c1.09-4.81 4.663-6.877 7.498-6.729.473.03.884.058 1.3.12M97.053 41.65c3.189.473 4.547 2.066 5.992 4.428 2.066-1.831 3.806-2.98 6.995-2.539.412.058.827.148 1.268.267 2.716.68 5.547 3.691 5.226 8.589l-.235 1.621c-.986 4.392-5.002 9.343-15.172 14.735a2.372 2.372 0 01-2.777-.408c-8.209-8.086-10.61-13.984-10.329-18.459l.235-1.621c1.09-4.81 4.662-6.876 7.497-6.728.474.029.914.058 1.3.119"
        fill={true ? Colors.white : Colors.white}
      />
    </Svg>
  );
}

export default CardComponent;
