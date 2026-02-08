import Toast, { BaseToast } from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { NavigationScreenNavigationType } from "../navigation/StackNavigator";
import { Colors } from "../utils";
import { Text, View } from "react-native";
import { Image } from "expo-image";
import { Chats } from "../context/ChatContext/ChatInterface";
import { useChat } from "../context/ChatContext/ChatProvider";
import { useRef } from "react";
import { DateNotification } from "../utils/Date.interface";
import { useRender } from "../context";
import CacheImage from "./CacheImage/CacheImage";

const ToastNotification = () => {
  const { chatVisto } = useChat();
  const { setLoader } = useRender();
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const ToastRef = useRef(null);
  const toastConfig = {
    /*
          Overwrite 'success' type,
          by modifying the existing `BaseToast` component
        */
    success: (props: any) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: Colors.green, height: "auto" }}
        contentContainerStyle={{ padding: 15 }}
        text1Style={{
          fontSize: 20,
          fontFamily: "Regular",
        }}
        text2Style={{
          fontSize: 14,
          fontFamily: "Regular",
        }}
        text2NumberOfLines={10}
      />
    ),

    error: (props: any) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: Colors.danger, height: "auto" }}
        contentContainerStyle={{ padding: 15 }}
        text1Style={{
          fontSize: 20,
          fontFamily: "Regular",
        }}
        text2Style={{
          fontSize: 14,
          fontFamily: "Regular",
        }}
        text2NumberOfLines={10}
      />
    ),

    warning: (props: any) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: Colors.yellow, height: "auto" }}
        contentContainerStyle={{ padding: 15 }}
        text1Style={{
          fontSize: 20,
          fontFamily: "Regular",
        }}
        text2Style={{
          fontSize: 14,
          fontFamily: "Regular",
        }}
        text2NumberOfLines={10}
      />
    ),
    Message: ({ text1, text2, props }: any) => {
      const data = props as Chats;
      const toChat = (item: Chats) => {
        if (!item.visto) {
          chatVisto(item.idChat);
        }

        navigation.navigate("MessaginScreen", {
          idDestination: item.infoUser.userId,
          idChat: item.idChat,
        });
      };
      return (
        <BaseToast
          onPress={() => toChat(data)}
          renderLeadingIcon={() => (
            <View style={{ width: "85%", paddingHorizontal: 8, paddingVertical: 4, flexDirection: "row", gap: 10 }}>
              <View className=" w-10 h-full justify-center ">
                <CacheImage
                  classNameImage=" rounded-full w-full"
                  styleImage={{ height: 40 }}
                  source={data.picture}

                />
              </View>
              <View className=" justify-center ">
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Bold",
                  }}
                >
                  {text1}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Regular",
                    flexWrap: "wrap",
                  }}
                >
                  {text2.length < 30 ? text2 : text2.slice(0, 30) + "..."}
                </Text>
              </View>
            </View>
          )}
          {...props}
          style={{ borderLeftColor: Colors.blackBackground, height: "auto" }}
          text2NumberOfLines={10}
        />
      );
    },
    Cita: ({ text1, text2, props }: any) => {
      const data = props as DateNotification;
      const toCita = (item: DateNotification) => {
        navigation.navigate("DateScreen");
      };
      return (
        <BaseToast
          onPress={() => toCita(data)}
          renderLeadingIcon={() => (
            <View style={{ width: "85%", paddingHorizontal: 8, paddingVertical: 4, flexDirection: "row", gap: 10 }}>
              <View className=" w-10 h-full justify-center ">
                <CacheImage
                  classNameImage=" rounded-full w-full"
                  styleImage={{ height: 40 }}
                  source={data.urlImage}
                />
              </View>
              <View className=" justify-center ">
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Bold",
                  }}
                  numberOfLines={1}
                >
                  {text1}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Regular",
                    flexWrap: "wrap",
                  }}
                  numberOfLines={1}
                >
                  {text2}
                </Text>
              </View>
            </View>
          )}
          {...props}
          style={{ borderLeftColor: Colors.blackBackground, height: "auto" }}
          text2NumberOfLines={10}
        />
      );
    },
  };
  return (
    <>
      <Toast config={toastConfig} />
    </>
  );
};

export default ToastNotification;
