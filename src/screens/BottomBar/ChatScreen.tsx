import { View, Text } from "react-native";
import { useEffect, useState } from "react";
import ScreenContainer from "../../components/ScreenContainer";
import { Colors } from "../../utils";
import CardLayout from "../../components/CardLayout/CardLayout";
import { font } from "../../../styles";
import { Ionicons } from "@expo/vector-icons";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useChat } from "../../context/ChatContext/ChatProvider";
import { useStore } from "../../context/storeContext/StoreState";
import moment from "moment";
import { FlatList } from "react-native";
import { GetHeader, width } from "../../utils/Helpers";
import { Chats } from "../../context/ChatContext/ChatInterface";
import DialogNoChats from "../../components/Dialog/DialogNoChats/DialogNoChats";
import OptionsBaseCustomers from "../../components/OptionsBaseCustomers/OptionsBaseCustomers";
import { MatchResponse } from "../../context/storeContext/StoreInterface";
import { HttpService } from "../../services";
import { useAuth } from "../../context";

const ChatScreen = () => {
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const { Chats, chatVisto } = useChat();
  const { Match, CitasEnviadas, CitasRecibidas, setMatch} = useStore();
  const isFocus = useIsFocused();
  const [NoChatsShow, setNoChatsShow] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [UserSelect, setUserSelect] = useState<number>(0);
    const { TokenAuthApi ,SesionToken } = useAuth();
  async function GetMatch() {
    try {
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/customers/get-my-match/${SesionToken}?page=0&size=100`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response: MatchResponse = await HttpService("get", host, url, {}, header);

      if (response.codigoRespuesta == "00") {
        setMatch(response.customers);
      }
    } catch (err: any) {
      setMatch([])
      console.error(JSON.stringify(err));
    }
  }

  useEffect(() => {
    if (isFocus) {
      (async () => {
        
        if(!Match){
           await GetMatch()
           return
        }
        if (!Chats.length) {
          setNoChatsShow(true);
        }

      })()
    }
  }, [Chats, isFocus]);
  

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
    <ScreenContainer>
      <View className=" px-5 py-2 mb-2 ">
        <Text
          style={{
            fontSize: 25,
            fontFamily: "Bold",
            color: Colors.primary,
          }}
        >
          Chanceos
        </Text>
      </View>
      <View className=" h-[90vh] bg-white ">
        {Match || CitasEnviadas.length || CitasRecibidas.length ? (
          <FlatList
            keyExtractor={(item) => item.idChat.toString()}
            data={Chats}
            renderItem={({ item, index }) => {
              return (
                <CardLayout
                  idUser={item.infoUser.userId}
                  photo={{ uri: item.picture }}
                  key={item.idChat}
                  onPress={() => toChat(item)}
                  onLongPress={() => {
                    setUserSelect(Number(item.infoUser.userId));
                    setIsVisible(true);
                  }}
                >
                  <Text className=" text-md " style={font.Bold}>
                    {item.infoUser.displayName}
                  </Text>
                  <View className=" flex-row  justify-between items-end gap-x-2 ">
                    <View className="flex-row items-center gap-x-2">
                      {item.visto ? (
                        <Ionicons name="checkmark-done-sharp" size={15} color={Colors.secondary} />
                      ) : (
                        /* <Ionicons name="checkmark-sharp" size={15} color={Colors.graySemiDark} /> */
                        <View className=" h-3 w-3 bg-primary rounded-full "></View>
                      )}

                      <Text className=" text-sm mt-1 w-[50%] " numberOfLines={1} style={font.Regular}>
                        {item.ultimoMensaje}
                      </Text>
                    </View>
                    <Text className=" text-xs " style={font.Regular}>
                      {moment(new Date(item.fecha)).format("DD/MM/YYYY h:mm A")}
                    </Text>
                  </View>
                </CardLayout>
              );
            }}
            style={{ width: width, gap: 10 }}
          ></FlatList>
        ) : (
          <View className=" w-full h-1/2 items-center justify-center border rounded-2xl border-primary">
            <Text
              style={[
                font.Bold,
                {
                  textAlign: "center",
                  textAlignVertical: "center",
                  color: Colors.primary,
                },
              ]}
            >
              Todavía no haz chanceado con nadie, mejora tus fotos para que más personas le gustes.
            </Text>
          </View>
        )}
      </View>
      <DialogNoChats active={NoChatsShow} setActive={setNoChatsShow} navigation={navigation} />
      <OptionsBaseCustomers active={isVisible} setActive={setIsVisible} data={{ idDestino: UserSelect.toString() }} />
    </ScreenContainer>
  );
};

export default ChatScreen;
