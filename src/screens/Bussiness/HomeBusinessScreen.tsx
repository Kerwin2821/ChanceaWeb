import {
  StyleSheet,
  View,
  Dimensions,
  FlatList,
  RefreshControl,
  VirtualizedList,
  ActivityIndicator,
  AppState,
  Text,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { HttpService } from "../../services";
import { GetHeader, ToastCall } from "../../utils/Helpers";
import * as Location from "expo-location";
import { useAuth, useRender } from "../../context";
import { useNavigation, useRoute, useIsFocused, DrawerActions } from "@react-navigation/native";
import { Colors } from "../../utils";
import { Avatar, FAB } from "@rn-vui/themed";
import { AntDesign, Entypo, FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { font } from "../../../styles";
import { useStore } from "../../context/storeContext/StoreState";
import { useSesionBusinessStore } from "../../context/AuthBusinessHooks/useAuthBusinessHooks";
import { BarChart, LineChart } from "react-native-chart-kit";
import { DashboardBusinessResponse } from "../../context/storeBusinessHooks/BusinessResponses.interface";
import { useStoreBusiness } from "../../context/storeBusinessHooks/useStoreBusiness";
import { BottomTabNavigationType } from "../../navigation/BottomTab";
import { BottomTabBusinessNavigationType } from "../../navigationBusiness/BottomTabBusiness";

const { width, height } = Dimensions.get("window");

const dayNamesShort = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  
 // Define the order of days to extract data
 const orderedDays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const HomeBusinessScreen = () => {
  const { setLoader, setPrecioDolar } = useRender();
  const { TokenAuthApi, SesionToken, setTokenAuthApi } = useAuth();
  const navigationBottom = useNavigation<BottomTabBusinessNavigationType>()
  const { sesionBusiness, resetSesion } = useSesionBusinessStore();
  const { DashboardData, setDashboardData } = useStoreBusiness();
  const fecha = useMemo(() => new Date().toLocaleDateString("es-ES", { dateStyle: "long" }), []);
  const chartData = useMemo(() => {
    // If weeklyData is undefined, return an array of zeros
    if (!DashboardData) {
      const zeroValues = orderedDays.map(() => 0);
      
      return {
        labels: dayNamesShort,
        datasets: [
          {
            data: zeroValues,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      };
    }
    
    // Extract count values in the correct order
    const countValues = orderedDays.map(day => DashboardData.weeklyData[day]?.count || 0);
    
    // Return the formatted chart data
    return {
      labels: dayNamesShort,
      datasets: [
        {
          data: countValues,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [DashboardData]); // Only recalculate when weeklyData changes

  ///api/chancea/reservations/business/dassboard/{sessionToken}/{businessId}

  /* async function getBsPrices() {
    try {
      const host = process.env.APP_BASE_API;
      const url = '/services/cuponservices/api/payment-infos/getCurrencyValue';
      const header = await GetHeader(TokenAuthApi, 'application/json');
      const response = await HttpService('get', host, url, {}, header);

      if (response.codigoRespuesta === '00') {
        setPrecioDolar(Number(response.bs));
      }
    } catch (err: any) {
      console.error(JSON.stringify(err), 'User');
      if (err && err?.status) {
        ToastCall('error', 'error de conexion en con el Servidor', 'ES');
      } else {
        ToastCall('error', 'Tienes problemas de conexion', 'ES');
      }
    } // Displaying the stringified data in an alert popup
  } */
  async function getDashboardData() {
    if (!sesionBusiness) return;
    try {
      const host = process.env.APP_BASE_API;
      const url = "/api/appchancea/reservations/business/dashboard-with-weekly-data/" + SesionToken + "/" + sesionBusiness.id;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response: DashboardBusinessResponse = await HttpService("get", host, url, {}, header);
      console.log(response)
      setDashboardData(response);
    } catch (err: any) {
      console.error(JSON.stringify(err), "User");
      if (err && err?.status) {
        ToastCall("error", "error de conexion en con el Servidor", "ES");
      } else {
        ToastCall("error", "Tienes problemas de conexion", "ES");
      }
    } // Displaying the stringified data in an alert popup
  }

  /*  const transformCuponUsedLastDays = (cuponUsedLastDays: CuponUsedLastDays): CuponUsedLastDays => {
    const transformed: CuponUsedLastDays = {};
    const todayIndex = moment().day(); // Índice del día de hoy (0: Domingo, 1: Lunes, ..., 6: Sábado)
  
    // Coloca "Hoy" al principio del objeto
    transformed['Hoy'] = cuponUsedLastDays[todayIndex.toString()];
  
    // Agrega los demás días de la semana en orden a partir del día actual
    for (let i = 1; i < 7; i++) {
      const dayIndex = (todayIndex + i) % 7;
      const dayOfWeekShort = dayNamesShort[dayIndex];
      transformed[dayOfWeekShort] = cuponUsedLastDays[dayIndex.toString()];
    }
  
    return transformed;
  }; */

  /*  const getGraphics = useCallback(async () => {
    try {
      const host = process.env.APP_BASE_API;
      const url = `/services/cuponservices/api/cuponapp/businesses/graphics/${SesionBusiness?.business.id}`;
      const header = await GetHeader(TokenAuthApi, 'application/json');
      const response: ResponseGraphics = await HttpService('get', host, url, {}, header, setLoader);
      
      setDataGraphis(transformCuponUsedLastDays(response.cuponUsedLastDays))
    } catch (error) {
      console.log(JSON.stringify(error));
    }
  }, [TokenAuthApi]); */
  /* const getCupouns = useCallback(async () => {
    try {
      const host = process.env.APP_BASE_API;
      const url = `/services/cuponservices/api/cuponapp/lotes/byBusinessId/${SesionBusiness?.business.id}?page=0&size=20`;
      const header = await GetHeader(TokenAuthApi, 'application/json');
      const response: LoteBusiness[] = await HttpService('get', host, url, {}, header, setLoader);
      setCupones(response.sort((a, b) => (b.id - a.id )));
    } catch (error) {
      console.log(JSON.stringify(error));
    }
  }, [TokenAuthApi]); */
  /*  const getLastTransacctions = useCallback(async () => {
    try {
      const host = process.env.APP_BASE_API;
      const url = `/services/cuponservices/api/operations?businessId.equals=${SesionBusiness?.business.id}&page=0&size=20`;
      const header = await GetHeader(TokenAuthApi, 'application/json');
      const response = await HttpService('get', host, url, {}, header, setLoader);
      setTransaction(response);
    } catch (error) {
      console.log(JSON.stringify(error));
    }
  }, [TokenAuthApi]); */

  const GetTokenAPI = async () => {
    try {
      const username = process.env.AUTH_API_USERNAME;
      const password = process.env.AUTH_API_PASSWORD;
      const host = process.env.APP_BASE_API;
      const url = "/api/authenticate";
      const req = { username, password };
      const response = await HttpService("post", host, url, req);
      if (response) {
        setTokenAuthApi(response.id_token);
      }
    } catch (err: any) {
      console.error(JSON.stringify(err), "User");
      if (err && err?.status) {
        ToastCall("error", "error de conexion en con el Servidor", "ES");
      } else {
        ToastCall("error", "Tienes problemas de conexion", "ES");
      }
    }
  };

  const getItem = (data: any, index: number) => {
    return data[index];
  };
  useEffect(() => {
    (async () => {
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/business-sessions/validate/${SesionToken}`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response = await HttpService("get", host, url, {}, header, setLoader);
      console.log(response)
      if (response.codigoRespuesta === "18") {
        resetSesion();
        ToastCall("warning", "Sesión Expirada", "ES");
      }
    })();
  }, []);

  useEffect(() => {
    if (sesionBusiness) {
      if (!TokenAuthApi) {
        GetTokenAPI();
        return;
      }
      if (TokenAuthApi) {
        getDashboardData();
        /* getCupouns();
        getGraphics();
        getLastTransacctions();
        getBsPrices() */
      }
    }
  }, [TokenAuthApi, sesionBusiness]);
  /* useEffect(() => {
    if (SesionBusiness) {
      if (!TokenAuthApi) {
        GetTokenAPI();
        return;
      }
      if (TokenAuthApi) {
        getCupouns();
        getGraphics();
        getLastTransacctions();
        getBsPrices()
      }
    }
  }, [TokenAuthApi, SesionBusiness]); */
  return (
    <View className=" px-2 h-[100vh] bg-white">
      <View className="flex-row justify-between items-center   pr-4  h-[10vh]  ">
        <View className=" flex flex-col w-1/2 ">
          <Text style={[font.Bold]} lineBreakMode="middle" className=" text-xl">
            Estado de tu negocio
          </Text>
          <Text style={[font.SemiBold]} className="text-xs text-gray-400">
            {fecha}
          </Text>
        </View>

        <View>
          <TouchableOpacity
            style={{
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 10,
            }}
            onPress={() => {navigationBottom.navigate("PerfilBusinessScreen")}}
          >
            <Avatar
              size={height / 14}
              source={sesionBusiness?.urlLogo ? { uri: sesionBusiness?.urlLogo } : { uri:"" } }

            ></Avatar>
          </TouchableOpacity>
        </View>
      </View>

      <View className=" bg-white  items-center h-[70vh] ">
        <View className=" w-full  h-1/2">
          <Text style={[font.Bold, { fontSize: 14 }]}>
            <AntDesign name="linechart" size={20} color={Colors.primary} /> Balance Reservaciones
          </Text>
          <View className=" flex-row">
            <View className="">
              <LineChart
                data={chartData}
                width={Dimensions.get("window").width * 0.9} // from react-native
                height={height * 0.3}
                /* yAxisLabel="$"
                yAxisSuffix="k"
                yAxisInterval={1} // optional, defaults to 1 */
                withHorizontalLabels={false}
                chartConfig={{
                  backgroundColor: "#FFFFFF",
                  backgroundGradientFrom: "#FFFFFF",
                  backgroundGradientTo: "#FFFFFF",
                  decimalPlaces: 2, // optional, defaults to 2dp
                  color: (opacity = 1) => `rgba(170, 142, 214, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(170, 142, 214, ${opacity})`,
                  style: {
                    borderRadius: 8,
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#FFFFFF",
                  },
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                  marginLeft: -50, // Ajusta este valor según necesites
                }}
              />
            </View>
            <View className=" flex-col flex-1 gap-1">
              <View className="flex-1 flex-row bg-violet-300 rounded-t-lg justify-center items-center gap-1">
                <FontAwesome5 name="check-double" size={14} color="white" />
                <Text style={[font.Bold]} className="text-white text-base">
                  {DashboardData?.dashboardData.countReservationConfirmed}
                </Text>
                {/* <Text style={[font.Bold]} className=" text-xs">
                  Comfir
                </Text> */}
              </View>
              <View className="flex-1 flex-row bg-violet-300 justify-center items-center gap-1">
                <MaterialCommunityIcons name="cancel" size={14} color="white" />
                <Text style={[font.Bold]} className="text-white text-base">
                  {DashboardData?.dashboardData.countReservationCancelled}
                </Text>
                {/* <Text style={[font.Bold]} className=" text-xs">
                  Comfir
                </Text> */}
              </View>
              <View className="flex-1 flex-row bg-violet-300  justify-center items-center gap-1">
                {/* <FontAwesome5 name="check-double" size={14} color="white" /> */}
                <AntDesign name="star" size={14} color="white" />
                <Text style={[font.Bold]} className="text-white text-base">
                  {DashboardData?.dashboardData.countReservationCompleted}
                </Text>
                {/* <Text style={[font.Bold]} className=" text-xs">
                  Comfir
                </Text> */}
              </View>
              <View className="flex-1 flex-row bg-violet-300 rounded-b-lg justify-center items-center gap-1">
                <AntDesign name="dashboard" size={14} color="white" />
                <Text style={[font.Bold]} className="text-white text-base">
                  {DashboardData?.dashboardData.countTotalReservation}
                </Text>
                {/* <Text style={[font.Bold]} className=" text-xs">
                  Comfir
                </Text> */}
              </View>
            </View>
          </View>

          {/* {DataGraphis ? (
            <BarChart
              data={{
                labels: Object.keys(DataGraphis),
                datasets: [
                  {
                    data: Object.values(DataGraphis)
                  }
                ]
              }}
              width={Dimensions.get('window').width *0.90 } // from react-native
              height={height * 0.25}
              yAxisLabel=""
              yAxisSuffix=""
              yAxisInterval={1} // optional, defaults to 1
              chartConfig={{
                backgroundColor: '#FFFFFF',
                backgroundGradientFrom: '#FFFFFF',
                backgroundGradientTo: '#FFFFFF',
                decimalPlaces: 2, // optional, defaults to 2dp
                color: (opacity = 1) => `rgba(42, 44, 57, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(42, 44, 57, ${opacity})`,
                style: {
                  borderRadius: 8
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#FFFFFF'
                }
              }}
              style={{
                marginVertical: 8
              }}
            />
          ) : null} */}
        </View>
        <View className=" w-full h-1/2 gap-y-1 ">
          <View className=" flex-1  gap-1 flex-row">
            <View className=" flex-1 bg-violet-200 rounded-lg justify-center items-center">
              <Text style={[font.Bold]} className="text-white text-sm">
                Resrv. Hoy
              </Text>
              <View className=" flex flex-row gap-2 justify-center items-center">
                <Text style={[font.Bold]} className="text-white text-2xl">
                  {DashboardData?.dashboardData.countReservationToday}
                </Text>
                <Ionicons name="today" size={24} color="white" />
              </View>
            </View>
            <View className=" flex-1 bg-secondary rounded-lg justify-center items-center">
              <Text style={[font.Bold]} className="text-white text-sm">
                Visitantes totales
              </Text>
              <View className=" flex flex-row gap-2 justify-center items-center">
                <Text style={[font.Bold]} className="text-white text-2xl">
                  {DashboardData?.dashboardData.visitorsChancea.length}
                </Text>
                <Entypo name="calendar" size={24} color="white" />
              </View>
            </View>
          </View>
          <View className=" flex-1  gap-1 flex-row rounded-lg">
            <View className=" flex-1 bg-violet-200 rounded-lg justify-center items-center">
              <Text style={[font.Bold]} className="text-white text-sm">
                Resrv. Mañana
              </Text>
              <View className=" flex flex-row gap-2 justify-center items-center">
                <Text style={[font.Bold]} className="text-white text-2xl">
                  {DashboardData?.dashboardData.countReservationTomorrow}
                </Text>
                <MaterialIcons name="next-plan" size={24} color="white" />
              </View>
            </View>
            <View className=" flex-1 bg-violet-200 rounded-lg justify-center items-center">
              <Text lineBreakMode="middle" style={[font.Bold]} className="text-white text-sm w-2/3 text-center">
                Resrv. Pasado Mañana
              </Text>
              <View className=" flex flex-row gap-2 justify-center items-center">
                <Text style={[font.Bold]} className="text-white text-xl">
                  {DashboardData?.dashboardData.countReservationYesterday}
                </Text>
                <MaterialCommunityIcons name="page-next" size={24} color="white" />
              </View>
            </View>
          </View>
        </View>
        {/* <View className=" w-full h-1/4 px-3 ">
          <Text style={[font.Bold, { fontSize: 18 }]}>Cupones Activos</Text>
          <FlatList
            data={Cupones}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            keyExtractor={(item: LoteBusiness) => item.id.toString()}
            renderItem={({ item }) => <CarruselComBusiness data={item} navigation={navigation} />}
            horizontal
            style={{ backgroundColor: '#FFF' }}
            ListEmptyComponent={() => <ActivityIndicator color={Colors.primary} size={48} />}
          />
        </View> */}
        {/* <View className=" h-1/3  p-2">
          <Text style={[font.Bold, { fontSize: 18 }]}>Ultimos cupones utilzados</Text>
          <View
            className=" w-full bg-white rounded-2xl p-2"
            style={{
              shadowColor: Colors.black,
              shadowOffset: {
                width: 0,
                height: 5,
              },
              shadowOpacity: 0.29,
              shadowRadius: 4.65,
              elevation: 5,
            }}
          >
            <FlatList
              data={Transaction}
              initialNumToRender={3}
              maxToRenderPerBatch={3}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item, index }) => <TransacctionCard transaction={item} key={index} />}
              style={{ backgroundColor: '#FFF' }}
              ListEmptyComponent={
                <Text className=" text-center w-full h-full " style={font.Bold}>
                  No Hay Transacciones
                </Text>
              }
            />
          </View>
        </View> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonRender: {
    width: "40%",
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  buttonRenderWhite: {
    borderColor: Colors.grayLight,
    shadowColor: Colors.transparent,
  },
  container: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  cardContainer: {
    alignItems: "center",
    justifyContent: "center",
    width,
  },
  cardWrapper: {
    borderRadius: 8,
    overflow: "hidden",
  },
  card: {
    width: width * 0.9,
    height: width * 0.5,
  },
  cornerLabel: {
    position: "absolute",
    bottom: 0,
    right: 0,
    borderTopLeftRadius: 8,
  },

  separator: {
    paddingTop: 30,
    backgroundColor: "white",
  },
  cornerLabelText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 2,
    paddingBottom: 2,
  },
});

export default HomeBusinessScreen;

function getWeeklyCountValues(
  weeklyData: Record<string, { count: number; dayName: string; reservations: any[] }>,
  orderedDays: string[] = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
): number[] {
  // Map each day in the ordered array to its corresponding count value
  return orderedDays.map(day => {
    // If the day exists in weeklyData, return its count, otherwise return 0
    return weeklyData[day]?.count || 0;
  });
}