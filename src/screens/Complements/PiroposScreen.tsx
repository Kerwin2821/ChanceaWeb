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

export default function PiroposScreen() {
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const { user, setUser, TokenAuthApi, SesionToken } = useAuth();
  const { setLoader } = useRender();
  const { Piropos, setPiropos } = useStore();
  const isFocus = useIsFocused();
  const [isVisible, setIsVisible] = useState(false);
  const [visible1, setVisible1] = useState(false);
  const [UserSelect, setUserSelect] = useState<number>(0);

  /* async function GetWhoLikeMeList() {
    try {
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/customer-has-piropos-cprofile/${SesionToken}?customerDestinationId.equals=${user?.id}&page=0&size=1000`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response = await HttpService("get", host, url, {}, header, setLoader);

      setPiropos(response.customerHasPiropoResponses);
      
    } catch (err: any) {
      console.error(JSON.stringify(err));
      if (err && err?.status) {
        ToastCall("error", "error de conexión en con el Servidor", "ES");
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES");
      }
    }
  } */

  /* useEffect(() => {
    GetWhoLikeMeList();
  }, [isFocus]); */
  useEffect(() => {
    console.log(Piropos,"Piropos")
    console.log(user?.id)
  }, [Piropos]);

  return (
    <ScreenContainer>
      <View className=" px-5 py-2 mb-2 ">
      <TouchableOpacity
            className=" absolute left-3 top-3 flex-row items-center z-10"
            onPress={() => navigation.goBack()}
          >
            <FontAwesome6 name="arrow-left" size={28} color="black" />
          </TouchableOpacity>
        <Text
          className="text-2xl text-primary text-center" 
          style={font.Bold}
        >
          Piropos
        </Text>
      </View>
      <View className=" items-center h-[85vh]">
        {Piropos.length ? (
          <FlatList
            keyExtractor={(item) => item.infoUser.id.toString()}
            data={Piropos}
            renderItem={({ item, index }) => {
              return (
                <CardLayout
                  idUser={item.infoUser.id}
                  key={item.infoUser.id}
                  photo={{uri:item.infoUser.customerProfiles[0].link}}
                  onPress={() =>
                    navigation.navigate("CustomerProfile", {
                      idCustomer: item.infoUser.id,
                      type: "Piropos",
                    })
                  }
                  onLongPress={() => {
                    setUserSelect(item.infoUser.id);
                    setIsVisible(true);
                  }}
                >
                  <Text className=" text-base " style={font.Bold}>
                    {(
                      item.infoUser.firstName.split(" ")[0] 
                    ).slice(0, 30)}
                  </Text>
                  <Text className=" text-sm " style={font.Regular}>
                    Dice: {item.ultimoMensaje}
                  </Text>
                </CardLayout>
              );
            }}
            style={{ width: width, gap: 10 }}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size={64} color={Colors.primary} />
              </View>
            }
          ></FlatList>
        ) : (
          <View className=" w-[90%] h-1/2 items-center border rounded-2xl border-primary ">
            <Text
              style={[
                font.Bold,
                {
                  width: "90%",
                  height: "100%",
                  textAlign: "center",
                  textAlignVertical: "center",
                  color: Colors.primary,
                },
              ]}
            >
              Todavía no tienes piropos con nadie, mejora tus fotos para que más personas le gustes.
            </Text>
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
