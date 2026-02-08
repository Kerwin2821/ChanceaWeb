import { useEffect, useState, useRef, useMemo } from "react";
import CustomMap, { MapMarker } from "../../components/CustomMap/CustomMap";
import { StyleSheet, View, TouchableOpacity, FlatList, Text, ActivityIndicator, Pressable, Platform } from "react-native";
import { Entypo, FontAwesome, FontAwesome6, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { DrawerActions, useIsFocused, useNavigation, useRoute } from "@react-navigation/native";
import { useAuth, useRender } from "../../context";
import { BottomTabNavigationType } from "../../navigation/BottomTab";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import { useStore } from "../../context/storeContext/StoreState";
import { CustomersHome } from "../../utils/Interface";
import { haversineDistance } from "../../utils/Helpers";
import { Colors } from "../../utils";
import { font } from "../../../styles";
import { LinearGradient } from "expo-linear-gradient";
import { FAB } from "@rn-vui/themed";
import { mapStyle } from "../../utils/Theme";
import { Image } from "expo-image";
import CacheImage from "../../components/CacheImage/CacheImage";

export default function MapasScreen() {
  const { user, DataCoordenadas, PreferenceFindUser } = useAuth();
  const { setLoader } = useRender();
  const isFocused = useIsFocused();
  const navigationBottom = useNavigation<BottomTabNavigationType>();
  const { Customers2, setCustomers2, setMatch, Match, Customers } = useStore();

  // const refMap = useRef<MapView>(null); // CustomMap handles ref internally if needed or we can forward ref
  // For simpler migration, let's assume CustomMap handles animations via props or we might need to expose a ref method.
  // Actually CustomMap updates region via useEffect on region prop change.

  const navigation = useNavigation<NavigationScreenNavigationType>();

  const [LocationData, setLocationData] = useState<{
    latitude: number;
    longitude: number;
  }>({ latitude: 0, longitude: 0 });
  const [destination, setDestination] = useState<{
    latitude: number;
    longitude: number;
  }>({ latitude: 0, longitude: 0 });

  const [DirectionAct, setDirectionAct] = useState(false);
  const [CuponSelect, setCuponSelect] = useState<CustomersHome | undefined>();
  const [StoreArray, setStoreArray] = useState<CustomersHome[]>([]);
  const [ShowMap, setShowMap] = useState(false);

  const route = useRoute();
  const data = route.params as { Customer: CustomersHome } | undefined;

  const getLocation = async () => {
    setLocationData({
      latitude: DataCoordenadas?.coords?.latitude,
      longitude: DataCoordenadas?.coords?.longitude,
    });
    focusCuponMapUser({
      latitude: DataCoordenadas?.coords?.latitude,
      longitude: DataCoordenadas?.coords?.longitude,
    });
  };

  const focusCuponMap = (e: CustomersHome) => {
    setLoader(true);
    setCuponSelect(e);
    setDestination({
      latitude: e.postionY,
      longitude: e.postionX,
    });
    // We update LocationData to trigger map movement via props
    setLocationData({
      latitude: e.postionY,
      longitude: e.postionX
    })
    setTimeout(() => {
      setLoader(false);
    }, 1000);
  };

  const focusCuponMapUser = (e?: { latitude: number; longitude: number }) => {
    setLoader(true);
    setCuponSelect(undefined);
    if (e) {
      setLocationData({ latitude: e.latitude, longitude: e.longitude });
    } else {
      // Recenter to user current location
      setLocationData({
        latitude: DataCoordenadas?.coords?.latitude || 0,
        longitude: DataCoordenadas?.coords?.longitude || 0,
      });
    }
    setTimeout(() => {
      setLoader(false);
    }, 1000);
  };

  useEffect(() => {
    if (data?.Customer) {
      setTimeout(() => {
        focusCuponMap(data?.Customer);
      }, 1000);
    } else {
      getLocation();
    }
    setTimeout(() => {
      setShowMap(true);
    }, 500);
  }, []);

  if (!ShowMap) {
    return <></>;
  }

  return (
    <View style={styles.container}>
      <View className="absolute top-14 left-5 z-20">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-md shadow-black/30"
        >
          <FontAwesome6 name="chevron-left" size={20} color="black" />
        </TouchableOpacity>
      </View>
      <View className="w-full justify-center items-center absolute z-10 bottom-[80%]">
        <View className=" w-[70%] "></View>
      </View>
      <View className=" absolute z-10 bottom-[30%] right-4 gap-y-2">
        <FAB
          icon={(() => <FontAwesome name="user" size={28} color="white" />) as any}
          color={Colors.primary}
          onPress={() => navigation.navigate("CustomerProfile", { Customer: CuponSelect, type: "WhoLikeMe" })}
          visible={!!destination.latitude && !!CuponSelect}
        />
        <FAB
          icon={(() => <MaterialIcons name="my-location" size={24} color="white" />) as any}
          color={Colors.primary}
          onPress={() => focusCuponMapUser()}
          visible={!!destination.latitude}
        />
      </View>
      <View className=" absolute z-10 bottom-[3%]">
        <FlatList
          data={Customers.filter((e) => e.shareLocation)}
          horizontal
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size={64} color={Colors.primary} />
            </View>
          }
          renderItem={(e) => (
            <ImageWithLoader2 key={e.index} e={e.item} CuponSelect={CuponSelect} focusCuponMap={focusCuponMap} />
          )}
        />
      </View>
      {isFocused && (
        <CustomMap
          region={{
            latitude: LocationData.latitude,
            longitude: LocationData.longitude,
            latitudeDelta: 0.002,
            longitudeDelta: 0.002,
          }}
          onMapReady={getLocation}
          userLocation={{
            latitude: DataCoordenadas?.coords?.latitude || 0,
            longitude: DataCoordenadas?.coords?.longitude || 0
          }}
          showUserLocation={true}
          userLocationRadius={PreferenceFindUser ? (PreferenceFindUser?.distance as number) * 1000 : undefined}
          markers={Customers.filter((e) => e.shareLocation).map((e, index) => ({
            id: e.id,
            coordinate: { latitude: e.postionY, longitude: e.postionX },
            title: e.firstName,
            image: e.customerProfiles && e.customerProfiles.length ? e.customerProfiles[0].link : undefined,
            onPress: () => navigation.navigate("CustomerProfile", { Customer: e, type: "WhoLikeMe" }),
            content: (
              <View
                style={{ height: 60, width: 60, borderRadius: 30, borderWidth: 3, borderColor: 'white' }}
                className=" justify-center items-center bg-gray-200 overflow-hidden shadow-black shadow-lg "
              >
                <CacheImage
                  source={{ uri: e.customerProfiles && e.customerProfiles.length ? e.customerProfiles[0].link : "" }}
                  classNameImage={"h-16 w-16 rounded-full"}
                />
              </View>
            )
          }))}
        >
        </CustomMap>
      )}
    </View>
  );
}
const ImageWithLoader2 = ({
  e,
  CuponSelect,
  focusCuponMap,
}: {
  e: CustomersHome;
  CuponSelect: CustomersHome | undefined;
  focusCuponMap: (e: CustomersHome) => void;
}) => {
  const [loading, setLoading] = useState(true);

  return (
    <TouchableOpacity
      style={[
        {
          width: 120,
          backgroundColor: Colors.white,
          borderRadius: 10,
          margin: 5,
          elevation: 0.4,
          justifyContent: "center",
          alignItems: "center",
          height: 180,
        },
        CuponSelect?.id === e.id ? { borderWidth: 2, borderColor: Colors.primary } : {},
      ]}
      onPress={() => {
        focusCuponMap(e);
      }}
    >
      {loading && (
        <View className=" absolute top-1/2 bottom-1/2 z-10">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}
      <CacheImage
        source={{ uri: e.customerProfiles.length ? e.customerProfiles[0].link : "" }}
        styleImage={{ width: 120, height: 150, borderRadius: 12, marginBottom: 30 }}
        onLoadEnd={() => setLoading(false)}
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.7)", "rgba(0,0,0,1)", "rgba(0,0,0,1)", "rgba(0,0,0,1)"]}
        className="absolute bottom-0 h-[33%] w-full bg-transparent rounded-br-2xl rounded-bl-2xl justify-center items-center"
      >
        <Text
          numberOfLines={2}
          style={[
            font.Regular,
            {
              fontSize: 10,
              marginLeft: 5,
              marginBottom: 5,
              color: "white",
              position: "absolute",
              bottom: 0,
            },
          ]}
        >
          {e.firstName.slice(0, 10)}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "110%",
  },
});
