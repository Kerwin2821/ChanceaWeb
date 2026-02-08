import { View, Text, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { Avatar, Dialog, ListItem } from "@rn-vui/themed";
import { font } from "../../../../styles";
import { GetHeader, ToastCall } from "../../../utils/Helpers";
import { HttpService } from "../../../services";
import { useAuth, useRender } from "../../../context";
import { Colors } from "../../../utils";
import { TouchableOpacity } from "react-native";
import { ScrollView } from "react-native";
import { Bank, CustomersHome } from "../../../utils/Interface";

type props = {
  active: boolean;
  setActive: (e: boolean) => void;
  data?: CustomersHome;
  onChange: (e:string) => void
  type?: "business" | "customer" ;
};


const DialogSelectBank = ({ active, setActive, data, onChange,type }: props) => {
  const { user, TokenAuthApi,SesionToken } = useAuth();
  const [Load, setLoad] = useState(false);
  const [Banks, setBanks] = useState<Bank[]>([]);
  const [CustomPiropo, setCustomPiropo] = useState(false);

  const toggleDialog1 = () => {
    setActive(!active);
  };

  async function queryPiropo() {
    try {
      setLoad(true);
      const host = process.env.APP_BASE_API;
      const url = type === "business" ?`/api/appchancea/banksBusiness/${SesionToken}?page=0&size=40`  : `/api/appchancea/banks/${SesionToken}?page=0&size=40`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response: Bank[] = await HttpService("get", host, url, {}, header);

      setBanks(response);
    } catch (err: any) {
      console.error(JSON.stringify(err), "User");
      if (err && err?.status) {
        ToastCall("error", "error de conexión en con el Servidor", "ES");
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES");
      }
    } finally {
      setLoad(false);
    }
  }

  useEffect(() => {
    if (active) {
      queryPiropo();
    }
  }, [active]);

  if(!active){
    return <></>
  }

  return (
    <Dialog
      isVisible={active}
      onBackdropPress={toggleDialog1}
      overlayStyle={{ backgroundColor: Colors.primary, borderRadius: 14, width: "90%" }}
    >
      {Load && (
        <View
          className=" absolute top-0 left-0 right-0 bottom-0 justify-center z-10"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <ActivityIndicator color={Colors.primary} size={64} />
        </View>
      )}
      <Text style={[{ textAlign: "center", fontSize: 24, color: Colors.white }, font.Bold]}>Bancos Nacionales</Text>

      {!CustomPiropo ? (
        <ScrollView className=" max-h-[90%] mt-5">
          {Banks.length
            ? Banks.map((e) => (
                <ListItem
                  bottomDivider
                  Component={TouchableOpacity}
                  onPress={() => {onChange(e.aba), toggleDialog1()}}
                  containerStyle={{ backgroundColor: Colors.white, borderRadius: 10, marginBottom: 5, marginRight: 10 }}
                >
                   <Avatar rounded source={{ uri: e.urlImagen }} />
                  <ListItem.Content>
                    <ListItem.Title style={[font.SemiBold, { color: Colors.secondary }]}>{e.name}</ListItem.Title>
                  </ListItem.Content>
                </ListItem>
              ))
            : null}
        </ScrollView>
      ) : null}
    </Dialog>
  );
};

export default DialogSelectBank;
