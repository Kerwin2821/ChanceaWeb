import { AntDesign, Entypo, FontAwesome, FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomTabNavigationProp, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Colors } from "../utils";
import Svg, { Mask, Path, G } from "react-native-svg";
import { useChat } from "../context/ChatContext/ChatProvider";
import { useAuth } from "../context";
import { useStore } from "../context/storeContext/StoreState";
import CopilotStepComponent from "../components/CopilotStep/CopilotStepComponent";
import { View } from "react-native";
import HomeBusinessScreen from "../screens/Bussiness/HomeBusinessScreen";
import PaquetesBusinessScreen from "../screens/Bussiness/PaquetesBusinessScreen";
import RegalosBusinessScreen from "../screens/Bussiness/RegalosBusinessScreen";
import ReservasBusinessScreen from "../screens/Bussiness/ReservasBusinessScreen";
import PerfilBusinessScreen from "../screens/Bussiness/PerfilBusinessScreen";
import { useEffect } from "react";

export type BottomTabBusinessNavigationType = BottomTabNavigationProp<BottomTabBusinessStackParamList>;

export type BottomTabBusinessStackParamList = {
  InitBusiness: any;
  MisCupones: any;
  Chat: any;
  Paquetes: any;
  PerfilBusinessScreen: any;
  RegaloScreen: any;
  CreateProds: any;
  Reservations: any;
};

// Navegador Bottom Tabs Navigator
const Tab = createBottomTabNavigator<BottomTabBusinessStackParamList>();

function BottomTabBusiness() {
  useEffect(() => {
    
    console.log("aqui")

  
  }, [])
  
  return (
    <Tab.Navigator
      initialRouteName="InitBusiness"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.graySemiDark,
        animation: 'shift',
      }}
    >
      <Tab.Screen
        name="InitBusiness"
        component={HomeBusinessScreen}
        options={{
          tabBarIcon: ({ color, focused, size }) => <ChanceaIcon size={size} color={color} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="RegaloScreen"
        component={RegalosBusinessScreen}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="card-search" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Paquetes"
        component={PaquetesBusinessScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View
              style={{
                position: "absolute",
                bottom: 10, // Ajusta según necesites
              }}
            >
              <View
                style={{
                  height: 48,
                  width: 48,
                  backgroundColor: Colors.secondary, // color violeta
                  borderRadius: 28,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                  padding: 0,
                  paddingTop: 2,
                  margin: 0,
                }}
              >
                {/* <FontAwesome name="plus" size={20} color="white" /> */}
                <FontAwesome5 name="gifts" size={18} color="white" />
              </View>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Reservations"
        component={ReservasBusinessScreen}
        options={{
          tabBarIcon: ({ color, size }) => <AntDesign name="star" size={size} color={color} />,
        }}
      />

      <Tab.Screen
        name="PerfilBusinessScreen"
        component={PerfilBusinessScreen}
        options={{
          tabBarIcon: ({ color, size }) => <FontAwesome5 name="user-alt" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

function ChanceaIcon(props: any) {
  return (
    <Svg
      width={props.size * 2}
      height={props.size}
      viewBox="0 0 135 135"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Mask id="a" maskUnits="userSpaceOnUse" x={0} y={0} width={135} height={135}>
        <Path d="M.086.333H134.16V134.36H.086V.333z" fill={props.focused ? Colors.primary : Colors.graySemiDark} />
      </Mask>
      <G mask="url(#a)">
        <Path
          d="M133.988 67.417c0 36.97-29.972 66.942-66.944 66.942-36.97 0-66.942-29.968-66.942-66.942C.102 30.445 30.074.473 67.044.473c36.972 0 66.944 29.972 66.944 66.944z"
          fill={props.focused ? Colors.primary : Colors.graySemiDark}
        />
      </G>
      <Path
        d="M37.292 15.35c-9.595 0-20.942-9.172-24.493-12.697a7.432 7.432 0 00-8.104-1.61A7.43 7.43 0 00.102 7.91c0 12.865 6.218 37.19 29.752 37.19a7.44 7.44 0 006.653-4.112l7.438-14.876a7.436 7.436 0 00-6.653-10.763zm92.106-14.308a7.423 7.423 0 00-8.108 1.615c-3.295 3.29-14.865 12.693-24.494 12.693a7.431 7.431 0 00-6.325 3.529 7.453 7.453 0 00-.328 7.237l7.439 14.877a7.44 7.44 0 006.653 4.109c23.534 0 29.753-24.326 29.753-37.19a7.432 7.432 0 00-4.59-6.87z"
        fill={props.focused ? Colors.primary : Colors.graySemiDark}
      />
      <Path
        d="M101.762 95.79a1.862 1.862 0 00-2.361-.109c-.146.109-14.587 10.786-32.357 10.786-17.724 0-32.214-10.677-32.355-10.785a1.872 1.872 0 00-2.362.108 1.86 1.86 0 00-.35 2.335c.48.8 11.964 19.499 35.067 19.499s34.591-18.7 35.068-19.5a1.856 1.856 0 00-.35-2.334zM58.517 68.507C46.412 56.4 26.957 56.259 26.135 56.259a3.714 3.714 0 00-3.715 3.712 3.72 3.72 0 003.711 3.727c.108 0 7.16.081 14.813 2.74-2.205 2.38-3.652 6.077-3.652 10.276 0 7.193 4.162 13.017 9.298 13.017s9.297-5.824 9.297-13.016c0-.648-.07-1.265-.137-1.886.048 0 .093.026.137.026a3.71 3.71 0 002.63-1.09 3.716 3.716 0 000-5.258zm49.437-12.248c-.822 0-20.272.142-32.381 12.248a3.714 3.714 0 000 5.258 3.709 3.709 0 002.629 1.09c.048 0 .088-.026.134-.026-.06.621-.134 1.238-.134 1.886 0 7.192 4.162 13.016 9.298 13.016s9.296-5.824 9.296-13.016c0-4.2-1.445-7.897-3.651-10.276 7.653-2.66 14.705-2.741 14.817-2.741a3.719 3.719 0 003.707-3.727 3.716 3.716 0 00-3.715-3.712z"
        fill="#553986"
      />
    </Svg>
  );
}
export default BottomTabBusiness;
