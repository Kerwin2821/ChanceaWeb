import { View, Text, ActivityIndicator, TouchableOpacity, FlatList, Dimensions, RefreshControl } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { useAuth, useRender } from "../../context";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons, FontAwesome5, Feather } from "@expo/vector-icons";
import { Avatar, FAB } from "@rn-vui/themed";
import { GetHeader, height } from "../../utils/Helpers";
import { font } from "../../../styles";
import { HttpService } from "../../services";
import { useStoreBusiness } from "../../context/storeBusinessHooks/useStoreBusiness";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import { useSesionBusinessStore } from "../../context/AuthBusinessHooks/useAuthBusinessHooks";
import { Colors } from "../../utils";
import CacheImage from "../../components/CacheImage/CacheImage";
import { GiftData } from "../Regalos/interface.regalos";
import CardRegaloBusiness from "../../components/CardRegaloBusiness/CardRegaloBusiness";
import { BottomTabNavigationType } from "../../navigation/BottomTab";
import { BottomTabBusinessNavigationType } from "../../navigationBusiness/BottomTabBusiness";

const RegalosBusinessScreen = () => {
  const { TokenAuthApi, SesionToken } = useAuth();
  const { Regalos, setRegalos } = useStoreBusiness();
  const { sesionBusiness } = useSesionBusinessStore();
  const { setLoader } = useRender();
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const navigationBottom = useNavigation<BottomTabBusinessNavigationType>();
  const isFocus = useIsFocused();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getGifts = useCallback(async () => {
    setRefreshing(true);
    setIsLoading(true);
    try {
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/business/gifs?sessionTokenId=${SesionToken}&statusGif.notEquals=POR_PAGAR`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response: GiftData[] = await HttpService("get", host, url, {}, header, setLoader);

      setRegalos(response);
    } catch (error) {
      console.log(JSON.stringify(error));
    } finally {
      setRefreshing(false);
      setIsLoading(false);
    }
  }, [TokenAuthApi, SesionToken]);

  useEffect(() => {
    if (isFocus) {
      getGifts();
    }
  }, [isFocus]);

  // Render empty component based on loading state
  const renderEmptyComponent = () => {
    if (isLoading) {
      return (
        <View className="flex-1 justify-center items-center py-20">
          <ActivityIndicator size={50} color={Colors.primary} />
          <Text className="text-gray-500 mt-4" style={font.Regular}>
            Cargando regalos...
          </Text>
        </View>
      );
    }

    return (
      <View className="flex-1 justify-center items-center py-20 px-6">
        <View className="w-20 h-20 bg-purple-100 rounded-full items-center justify-center mb-4">
          <FontAwesome5 name="gift" size={32} color="#9C27B0" />
        </View>
        <Text className="text-xl text-center text-secondary mb-2" style={font.Bold}>
          No tienes regalos
        </Text>
        <Text className="text-base text-center text-gray-500 mb-6" style={font.Regular}>
          Por el momento no tienes regalos. Los regalos aparecerán aquí cuando los clientes compren tus paquetes como regalo para otras personas.
        </Text>
        <View className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <View className="flex-row items-center mb-2">
            <Feather name="info" size={18} color={Colors.primary} />
            <Text className="ml-2 text-secondary font-semibold">Consejo</Text>
          </View>
          <Text className="text-sm text-gray-600">
            Asegúrate de tener paquetes atractivos que los clientes quieran regalar a sus Cuadres y Chanceos.
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center w-full px-4 pt-5 pb-4 bg-white border-b border-gray-100">
        <Text style={[font.Bold, { fontSize: 24, color: Colors.secondary }]}>Regalos</Text>

        <TouchableOpacity
          className="justify-center items-center"
          onPress={() => {navigationBottom.navigate("PerfilBusinessScreen")}}
        >
          <Avatar
            size={height / 14}
            source={sesionBusiness?.urlLogo ? { uri: sesionBusiness?.urlLogo } : { uri:"" }}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="flex-1 bg-white">
        <FlatList
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ 
            flexGrow: 1,
            paddingHorizontal: 16,
            paddingVertical: 12,
            gap: 16,
          }}
          data={Regalos}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={getGifts}
              colors={[Colors.primary]} 
            />
          }
          renderItem={({ item }) => (
            <CardRegaloBusiness
              onPress={() => {
                navigation.navigate("GiftDetallesBusiness", item);
              }}
              data={item}
              tipoRegalo="RECIBIDA"
            />
          )}
          ListEmptyComponent={renderEmptyComponent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

export default RegalosBusinessScreen;
