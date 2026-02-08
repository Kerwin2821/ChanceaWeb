import { View, Text, StyleSheet, FlatList, ActivityIndicator, Platform } from "react-native";
import { useEffect, useState } from "react";
import ScreenContainer from "../../components/ScreenContainer";
import { Colors } from "../../utils";
import { GetHeader, ToastCall, width } from "../../utils/Helpers";
import CardLayout from "../../components/CardLayout/CardLayout";
import { font } from "../../../styles";
import { environmet } from "../../../env";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import { useAuth, useRender } from "../../context";
import { useStore } from "../../context/storeContext/StoreState";
import { HttpService } from "../../services";
import { MatchResponse } from "../../context/storeContext/StoreInterface";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TouchableOpacity } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { UserData } from "../../context/AuthContext/AuthInterface";
import { Business } from "../Regalos/interface.regalos";

interface Notification {
  id: number;
  title: string;
  message: string;
  status: "SEND" | "DELIVERED" | "READ"; // puedes extender si hay más estados
  sendDate: string; // formato ISO 8601
  deliveredDate: string;
  readDate: string;
  customer: UserData;
  business: Business | null;
}

export default function NotificationScreen() {
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const { user, setUser, TokenAuthApi, SesionToken } = useAuth();
  const { setLoader } = useRender();
  /* const { Piropos, setPiropos } = useStore(); */
  const isFocus = useIsFocused();
  const [isVisible, setIsVisible] = useState(false);
  const [visible1, setVisible1] = useState(false);
  const [UserSelect, setUserSelect] = useState<number>(0);
  const [Notify, setNotify] = useState<Notification[]>([]);

  async function GetWhoLikeMeList() {
    try {
      const host = process.env.APP_BASE_API;
      /* const url = `/api/appchancea/customer-has-piropos-cprofile/${SesionToken}?customerDestinationId.equals=${user?.id}&page=0&size=1000`; */
      const url = `/api/appchancea/notification-pushes/customer?sessionToken=${SesionToken}&page=0&size=20'`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response = await HttpService("get", host, url, {}, header, setLoader);

      console.log(response, "NotificationScreen");
      setNotify(response);

      /* setPiropos(response.customerHasPiropoResponses) */
    } catch (err: any) {
      console.error(JSON.stringify(err));
      if (err && err?.status) {
        ToastCall("error", "error de conexión en con el Servidor", "ES");
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES");
      }
    }
  }

  /* useEffect(() => {
    GetWhoLikeMeList();
  }, [isFocus]); */
  useEffect(() => {
    /* console.log(Piropos,"Piropos")
    console.log(user?.id) */
    GetWhoLikeMeList();
  }, []);

  return (
    <ScreenContainer>
      <View className=" px-5 py-2 items-start z-30 ">
        <TouchableOpacity className=" items-center z-10 " onPress={() => navigation.goBack()}>
          <FontAwesome6 name="arrow-left" size={28} color="black" />
        </TouchableOpacity>
      </View>
      <View className=" px-3 my-2">
        <Text className=" text-2xl text-primary" style={font.Bold}>
          Notificaciones
        </Text>
      </View>
      <View style={{ flex: 1, alignItems: 'center' }}>
        {Notify.length ? (
          <FlatList
            keyExtractor={(item) => item.id.toString()}
            data={Notify}
            contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 20, width: Platform.OS === 'web' ? 500 : width }}
            renderItem={({ item }) => {
              const firstName = item.customer.firstName?.split(" ")[0] ?? "";
              const photoUri = item.customer.customerProfiles?.[0]?.link ?? null;

              return (
                <View className=" mb-3 ">
                  <CardLayout
                    idUser={item.customer.id}
                    key={item.customer.id}
                    photo={photoUri ? { uri: photoUri } : undefined}
                    onPress={() => { }}
                  >
                    <View className=" flex-1 ">
                      <Text className="text-base text-primary" style={font.Bold}>
                        {firstName}
                      </Text>
                      <Text className="text-sm text-gray-600 mt-1" style={font.Regular}>
                        {item.message}
                      </Text>
                    </View>
                  </CardLayout>
                </View>
              );
            }}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center py-20">
                <ActivityIndicator size="large" color={Colors.primary} />
              </View>
            }
          />
        ) : (
          <View className=" flex-1 justify-center items-center px-10 ">
            <View className=" bg-gray-50 p-8 rounded-3xl items-center border border-gray-100 shadow-sm " style={{ maxWidth: 400 }}>
              <FontAwesome6 name="bell-slash" size={60} color={Colors.primary} style={{ opacity: 0.5, marginBottom: 20 }} />
              <Text className=" text-xl text-primary text-center mb-3 " style={font.Bold}>
                No hay notificaciones
              </Text>
              <Text className=" text-base text-gray-500 text-center " style={font.Regular}>
                No hay notificaciones en este momento
              </Text>
            </View>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontFamily: "DosisMedium",
  },
  containerTransactions: {
    backgroundColor: Colors.white,
    paddingHorizontal: 10,
  },
  containerCenter: {
    justifyContent: "center",
    alignItems: "center",
  },
  containerForm: {
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginHorizontal: width * 0.05,
    position: "relative",
    minHeight: width * 0.7,
  },
  cancelButton: {
    backgroundColor: Colors.transparent,
    elevation: 0,
    borderStyle: "solid",
    borderWidth: 2,
    borderColor: Colors.blackBackground,
    marginVertical: 0,
    marginBottom: 30,
  },
  titles: {
    color: Colors.blackBackground,
    fontSize: 18,
    fontFamily: "Bold",
    textAlign: "center",
  },
  logo: {
    height: width * 0.3,
    width: width * 0.6,
    marginHorizontal: width * 0.2,
  },
  textTitle: {
    fontSize: 25,
    fontFamily: "Bold",
    color: Colors.white,
  },
  textSubTitle: {
    fontSize: 20,
    fontFamily: "DosisBold",
    color: Colors.blackBackground,
    marginVertical: 15,
  },
  containerButtons: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
    backgroundColor: "rgba(0,0,0,.5)",
  },
  modalView: {
    width: "80%",
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: Colors.blackBackground,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    position: "relative",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "DosisBold",
    fontSize: 18,
  },
  textReSend: {
    color: Colors.green,
    fontFamily: "DosisBold",
    fontSize: 20,
  },
  containerCheck: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    marginBottom: 30,
    width: "100%",
  },
  cancelButtonModal: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: Colors.danger,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 7,
  },
  text: {
    color: Colors.black,
    fontFamily: "Bold",
    fontSize: 14,
    textAlign: "left",
  },
  buttonRenderWhite: {
    borderColor: Colors.transparent,
    shadowColor: Colors.transparent,
    width: "auto",
    fontFamily: "Dosis",
  },
});
