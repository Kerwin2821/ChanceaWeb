import { View, Text, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { Dialog, ListItem } from "@rn-vui/themed";
import { font } from "../../../../styles";
import { GetHeader, ToastCall } from "../../../utils/Helpers";
import { crearPiropo, HttpService } from "../../../services";
import { useAuth, useRender } from "../../../context";
import { Colors } from "../../../utils";
import { TouchableOpacity } from "react-native";
import { ScrollView } from "react-native";
import { CustomersHome } from "../../../utils/Interface";
import { environmet } from "../../../../env";
import Input from "../../InputComponent/Input";
import Button from "../../ButtonComponent/Button";
type props = {
  active: boolean;
  setActive: (e: boolean) => void;
  data?: CustomersHome;
};

export interface Piropo {
  id: number;
  name: string;
  description: string;
  creationDate: string;
  status: string;
  gender: string;
}

const DialogMethodPiropos = ({ active, setActive, data }: props) => {
  const { user, TokenAuthApi, SesionToken } = useAuth();
  const [Load, setLoad] = useState(false);
  const [Piropos, setPiropos] = useState<Piropo[]>([]);
  const [Piropo, setPiropo] = useState("");
  const [CustomPiropo, setCustomPiropo] = useState(false);

  const toggleDialog1 = () => {
    setActive(!active);
  };

  async function queryPiropo() {
    try {
      setLoad(true);
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/piropos/${SesionToken}?page=0&size=1000`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response: Piropo[] = await HttpService("get", host, url, {}, header);

      setPiropos(response);
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

  async function SendPiropo(e: Piropo) {
    try {
      setLoad(true);

      /* const host = process.env.APP_BASE_API;
      const url = `/api/customer-has-piropos/send`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response = await HttpService(
        "post",
        host,
        url,
        {
          customerSourceId: user?.id,
          customerDestination: data?.id,
          personalizedPiropo: e.description,
        },
        header
      );
 */
      crearPiropo(user,data,e.description)

      ToastCall("success", "Piropo enviado con exito", "ES");
      toggleDialog1();
    } catch (err: any) {
      console.error(JSON.stringify(err), "User");
      if (err && err?.status) {
        ToastCall("error", "error de conexión en con el Servidor", "ES");
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES");
      }
    } finally {
      setLoad(false);
    } // Displaying the stringified data in an alert popup
  }

  async function SendPiropoCustom() {
    try {
      setLoad(true);

     /*  const host = process.env.APP_BASE_API;
      const url = `/api/customer-has-piropos/send`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response = await HttpService(
        "post",
        host,
        url,
        {
          customerSourceId: user?.id,
          customerDestination: data?.id,
          personalizedPiropo: Piropo,
        },
        header
      ); */

      crearPiropo(user,data,Piropo)

      ToastCall("success", "Piropo enviado con exito", "ES");
      setPiropo("");
      setCustomPiropo(false);
      toggleDialog1();
    } catch (err: any) {
      console.error(JSON.stringify(err), "User");
      if (err && err?.status) {
        ToastCall("error", "error de conexión en con el Servidor", "ES");
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES");
      }
    } finally {
      setLoad(false);
    } // Displaying the stringified data in an alert popup
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
      overlayStyle={{ backgroundColor: Colors.primary, borderRadius: 14, width: "90%", maxHeight:"90%" }}
    >
      {Load && (
        <View
          className=" absolute top-0 left-0 right-0 bottom-0 justify-center z-10"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <ActivityIndicator color={Colors.primary} size={64} />
        </View>
      )}
      <Text style={[{ textAlign: "center", fontSize: 24, color: Colors.white }, font.Bold]}>Piropos</Text>

      {CustomPiropo ? (
        <View className=" mt-4 items-center">
          <Input
            placeholder="Tanta carne y yo con hambre"
            keyboardType="default"
            value={Piropo}
            multiline
            maxLength={125}
            onChangeText={(e: string) => {
              setPiropo(e);
            }}
          />

          <View className="w-[50%] flex-row justify-center items-center mt-4">
            <Button text={"Volver"} onPress={() => setCustomPiropo(false)} />
            <Button typeButton="white" text={"Enviar"} disabled={!Piropo} onPress={SendPiropoCustom} />
          </View>
        </View>
      ) : null}

      {!CustomPiropo ? (
        <ScrollView className=" max-h-[90%] mt-5">
           <ListItem
            bottomDivider
            Component={TouchableOpacity}
            onPress={() => setCustomPiropo(true)}
            containerStyle={{ backgroundColor: Colors.secondary, borderRadius: 10, marginBottom: 5, marginRight: 10 }}
          >
            <ListItem.Content>
              <ListItem.Title style={[font.SemiBold, { color: Colors.white, fontSize:18}]}>Personalizado</ListItem.Title>
              <ListItem.Subtitle style={[font.Light, { color: Colors.white }]}>
                Es un piropo que le podrás decir lo que tu quieras.
              </ListItem.Subtitle>
            </ListItem.Content>
          </ListItem>
          {Piropos.length
            ? Piropos.map((e) => (
                <ListItem
                  bottomDivider
                  Component={TouchableOpacity}
                  onPress={() => SendPiropo(e)}
                  containerStyle={{ backgroundColor: Colors.white, borderRadius: 10, marginBottom: 5, marginRight: 10 }}
                >
                  <ListItem.Content>
                    <ListItem.Title style={[font.SemiBold, { color: Colors.secondary }]}>{e.name}</ListItem.Title>
                    <ListItem.Subtitle style={[font.Light]}>{e.description}</ListItem.Subtitle>
                  </ListItem.Content>
                </ListItem>
              ))
            : null}
        </ScrollView>
      ) : null}
    </Dialog>
  );
};

export default DialogMethodPiropos;
