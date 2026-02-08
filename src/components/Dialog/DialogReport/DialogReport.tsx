import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useEffect, useState } from "react";
import { CheckBox, Dialog, ListItem, TabView } from "@rn-vui/themed";
import Button from "../../ButtonComponent/Button";
import { useAuth } from "../../../context";
import { Colors } from "../../../utils";
import { GetHeader, ToastCall } from "../../../utils/Helpers";
import { HttpService } from "../../../services";
import { font } from "../../../../styles";
import Input from "../../InputComponent/Input";
import { Entypo, FontAwesome6 } from "@expo/vector-icons";
import { useStore } from "../../../context/storeContext/StoreState";
import { NavigationScreenNavigationType } from "../../../navigation/StackNavigator";
import { useChat } from "../../../context/ChatContext/ChatProvider";

type props = {
  active: boolean;
  setActive: (e: boolean) => void;
  data?: { idDestino: string };
  navigation?: NavigationScreenNavigationType;
  back: boolean;
  onSuccess?: () => void;
};

export interface TypeReport {
  id: number;
  name: string;
  description: string;
  complaintCategory: ComplaintCategory;
}

export interface ComplaintCategory {
  id: number;
  name: string;
  description: string;
}

const DialogReport = ({ active, setActive, data, navigation, back, onSuccess }: props) => {
  const { TokenAuthApi, SesionToken } = useAuth();
  const { Customers, setCustomers, Customers2, setCustomers2, CitasRecibidas, CitasEnviadas, setCitasRecibidas, setCitasEnviadas } = useStore();
  const { setChats, Chats } = useChat();
  const [Load, setLoad] = useState(false);
  const [CategoryReport, setCategoryReport] = useState<ComplaintCategory[] | undefined>();
  const [CategoryReportSelect, setCategoryReportSelect] = useState<ComplaintCategory | undefined>();
  const [TypeReport, setTypeReport] = useState<TypeReport[] | undefined>();
  const [TypeReportSelect, setTypeReportSelect] = useState<TypeReport | undefined>();
  const [DescriptionReport, setDescriptionReport] = useState("");
  const [index, setIndex] = useState(0);
  const { Match, setMatch } = useStore();

  const toggleDialog1 = () => {
    setActive(!active);
    setCategoryReportSelect(undefined);
    setTypeReportSelect(undefined);
    setDescriptionReport("");
    setIndex(0)
  };

  async function queryReportCategory() {
    try {
      setLoad(true);
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/complaint-categories/${SesionToken}?page=0&size=1000`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response: ComplaintCategory[] = await HttpService("get", host, url, {}, header);

      console.log(response);

      setCategoryReport(response);
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

  async function queryReportOptions() {
    try {
      setLoad(true);
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/complaint-sub-categories/${SesionToken}?complaintCategoryId.equals=${CategoryReportSelect?.id}&page=0&size=1000`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response: TypeReport[] = await HttpService("get", host, url, {}, header);

      setTypeReport(response);
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

  async function SendReport() {
    try {
      setLoad(true);

      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/complaints/generate`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response = await HttpService(
        "post",
        host,
        url,
        {
          sessionToken: SesionToken,
          customerDestination: data?.idDestino,
          complaintSubCategoryId: TypeReportSelect?.id,
          description: DescriptionReport,
        },
        header
      );

      console.log(response)

      if (data) {
        const userId = Number(data.idDestino);
        setCustomers(Customers.filter(e => e.id !== userId));
        setCustomers2(Customers2.filter(e => e.id !== userId));
      }

      if (Match) {
        setMatch(Match.filter((ele) => ele.id !== Number(data?.idDestino)));
      }
      if (Chats) {
        setChats(Chats.filter((ele) => Number(ele.infoUser.userId) !== Number(data?.idDestino)));
      }
      if (CitasRecibidas) {
        setCitasRecibidas(CitasRecibidas.filter((ele) => ele.customerSource.id !== Number(data?.idDestino)));
      }
      if (CitasEnviadas) {
        setCitasEnviadas(CitasEnviadas.filter((ele) => ele.customerDestination.id !== Number(data?.idDestino)));
      }
      toggleDialog1()
      ToastCall("success", "Usuario bloqueado con éxito", "ES");
      onSuccess && onSuccess();
      back && navigation?.goBack()
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
      queryReportCategory();
    }
  }, [active]);

  return (
    <Dialog
      isVisible={active}
      onBackdropPress={toggleDialog1}
      overlayStyle={{ borderRadius: 14, width: "90%", maxHeight: "80%", flex: 0.9 }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {Load && (
          <View
            className=" absolute top-0 left-0 right-0 bottom-0 justify-center z-10"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          >
            <ActivityIndicator color={Colors.primary} size={64} />
          </View>
        )}
        <View className="flex-row justify-center items-center relative mb-2">
          <Text style={[{ textAlign: "center", fontSize: 24, color: Colors.primary }, font.Bold]}>Reportar</Text>
          <TouchableOpacity
            className="absolute right-0"
            onPress={toggleDialog1}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Entypo name="cross" size={28} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <View className=" h-full ">
          <TabView
            value={index}
            onChange={setIndex}
            animationType="spring"
            disableSwipe
            containerStyle={{ overflow: "hidden" }}
          >
            <TabView.Item style={{ width: "100%" }}>
              <View className=" flex-1">
                <View className=" items-center mt-2">
                  <Text style={[font.SemiBold]}>Motivo del Reporte</Text>
                </View>
                <ScrollView className=" max-h-[70%] mt-2">
                  {CategoryReport
                    ? CategoryReport.map((e) => (
                      <ListItem
                        key={e.id}
                        bottomDivider
                        Component={TouchableOpacity}
                        onPress={() => setCategoryReportSelect(e)}
                        containerStyle={{
                          backgroundColor: CategoryReportSelect?.id === e.id ? Colors.primary : Colors.white,
                          borderRadius: 10,
                          marginBottom: 5,
                          marginRight: 10,
                          borderWidth: 1,
                          paddingVertical: 5,
                          paddingHorizontal: 5,
                          borderColor: Colors.primary,
                        }}
                      >
                        <View className="">
                          <CheckBox
                            checked={CategoryReportSelect?.id === e.id}
                            onPress={() => setCategoryReportSelect(e)}
                            checkedIcon="dot-circle-o"
                            uncheckedIcon="circle-o"
                            size={18}
                            checkedColor={Colors.white}
                            containerStyle={{
                              backgroundColor: CategoryReportSelect?.id === e.id ? Colors.primary : Colors.white,
                            }}
                          />
                        </View>
                        <ListItem.Content>
                          <ListItem.Title
                            style={[
                              font.SemiBold,
                              { color: CategoryReportSelect?.id === e.id ? Colors.white : Colors.secondary },
                            ]}
                          >
                            {e.name}
                          </ListItem.Title>
                          {/* <ListItem.Subtitle style={[font.Light]}>{e.description}</ListItem.Subtitle> */}
                        </ListItem.Content>
                      </ListItem>
                    ))
                    : null}
                </ScrollView>

                <View className=" items-center mt-2">
                  <View className=" w-1/2 ">
                    <Button
                      text={"Siguiente"}
                      disabled={!CategoryReportSelect}
                      onPress={() => {
                        setIndex(1), queryReportOptions();
                      }}
                    />
                  </View>
                </View>
              </View>
            </TabView.Item>
            <TabView.Item style={{ width: "100%" }}>
              <View className=" flex-1">
                <TouchableOpacity className=" absolute left-3 top-0 flex-row items-center " onPress={() => setIndex(0)}>
                  <FontAwesome6 name="arrow-left-long" size={28} color={Colors.primary} />
                </TouchableOpacity>
                <View className=" items-center mt-2">
                  <Text style={[font.SemiBold]}>Razón del Reporte</Text>
                </View>
                <ScrollView className=" max-h-[70%] mt-2">
                  {TypeReport
                    ? TypeReport.map((e) => (
                      <ListItem
                        key={e.id}
                        bottomDivider
                        Component={TouchableOpacity}
                        onPress={() => setTypeReportSelect(e)}
                        containerStyle={{
                          backgroundColor: TypeReportSelect?.id === e.id ? Colors.primary : Colors.white,
                          borderRadius: 10,
                          marginBottom: 5,
                          marginRight: 10,
                          borderWidth: 1,
                          paddingVertical: 5,
                          paddingHorizontal: 5,
                          borderColor: Colors.primary,
                        }}
                      >
                        <View className="">
                          <CheckBox
                            checked={TypeReportSelect?.id === e.id}
                            onPress={() => setTypeReportSelect(e)}
                            checkedIcon="dot-circle-o"
                            uncheckedIcon="circle-o"
                            size={18}
                            checkedColor={Colors.white}
                            containerStyle={{
                              backgroundColor: TypeReportSelect?.id === e.id ? Colors.primary : Colors.white,
                            }}
                          />
                        </View>
                        <ListItem.Content>
                          <ListItem.Title
                            style={[
                              font.SemiBold,
                              { color: TypeReportSelect?.id === e.id ? Colors.white : Colors.secondary },
                            ]}
                          >
                            {e.name}
                          </ListItem.Title>
                          {/* <ListItem.Subtitle style={[font.Light]}>{e.description}</ListItem.Subtitle> */}
                        </ListItem.Content>
                      </ListItem>
                    ))
                    : null}
                </ScrollView>
                <View className=" items-center  mt-2 ">
                  {/* <View className=" w-1/2 ">
                  <Button typeButton="white" text={"Volver"} onPress={() => setIndex(0)} />
                </View> */}
                  <View className=" w-1/2 ">
                    <Button text={"Siguiente"} disabled={!TypeReportSelect} onPress={() => setIndex(2)} />
                  </View>
                </View>
              </View>
            </TabView.Item>
            <TabView.Item style={{ width: "100%" }}>
              <View className=" flex-1 justify-center">
                <TouchableOpacity className=" absolute left-3 top-0 flex-row items-center " onPress={() => setIndex(1)}>
                  <FontAwesome6 name="arrow-left-long" size={28} color={Colors.primary} />
                </TouchableOpacity>
                <Text style={[font.SemiBold, { fontSize: 16, textAlign: "center", width: '100%' }]}>
                  Cuéntanos más acerca de lo sucedido para poder tomar mejores decisiones con lo ocurrido.
                </Text>
                <View className=" mt-4 w-full">
                  <Input
                    placeholder="Cuéntanos qué te pasó..."
                    keyboardType="default"
                    value={DescriptionReport}
                    multiline
                    maxLength={125}
                    onChangeText={(e: string) => {
                      setDescriptionReport(e);
                    }}
                    styleContainer={{ width: '100%', height: 120 }}
                    styleInput={{ height: 110 }}
                  />

                  <View className="w-full flex-row justify-center items-center mt-4">
                    <Button
                      showIcon
                      icon={<Entypo name="block" size={24} color="white" />}
                      IconDirection="left"
                      styleButton={{ backgroundColor: Colors.danger, width: '100%' }}
                      text={"Reportar y bloquear"}
                      onPress={SendReport}
                    />
                  </View>
                </View>
              </View>
            </TabView.Item>
          </TabView>
        </View>

      </KeyboardAvoidingView>

    </Dialog>
  );
};

export default DialogReport;
