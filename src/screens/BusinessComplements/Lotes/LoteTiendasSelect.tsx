import { View, Text, ActivityIndicator, FlatList } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useAuth, useRender } from '../../../context';
import { useStoreBusiness } from '../../../context/storeContextBusiness/StoreBusinessState';
import { RegisterLoginScreenNavigationType } from '../../../navigation/StackNavigation';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { GetHeader } from '../../../utils/Helpers';
import { HttpService } from '../../../services';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Entypo, FontAwesome, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { font } from '../../../../styles';
import { FAB, ListItem } from '@rn-vui/themed';
import { Stores } from '../../../context/storeContextBusiness/StoreBusinessInterface';

interface StoreSelection extends Stores {
  check: boolean;
}

export interface ValidateResponse {
  codigoRespuesta: string;
  mensajeRespuesta: string;
  name: string;
  value: boolean;
}

const LoteTiendasSelect = () => {
  const { SesionBusiness, TokenAuthApi, setTokenAuthApi } = useAuth();
  const { FormCreateLote, setFormCreateLote,RepCivil} = useStoreBusiness();
  const { setLoader } = useRender();
  const navigation = useNavigation<RegisterLoginScreenNavigationType>();
  const isFocus = useIsFocused();
  const [StoreCheck, setStoreCheck] = useState<StoreSelection[]>([]);
  const [SelectAll, setSelectAll] = useState(false);
  const [PayCupon, setPayCupon] = useState(false);
  const [CanSend, setCanSend] = useState(false);
  const {} = useStoreBusiness();

  const sendData = async () => {
    if(!RepCivil) return
    setFormCreateLote( { ...FormCreateLote, businessId:Number(SesionBusiness?.business.id), representativeId:(RepCivil.id),bStoreIds: StoreCheck.filter((e) => e.check).map((e) => Number(e.id))})
    if(PayCupon){
        navigation.navigate("LoteSelectPaymentMethod")
    }else{

      try {
        const host = process.env.APP_BASE_API;
        const url = "/services/cuponservices/api/cuponapp/cupons/generateCuponWithPromotion";
        const header = await GetHeader(TokenAuthApi, 'application/json');
        const response = await HttpService(
          'post',
          host,
          url,
          { ...FormCreateLote, businessId:Number(SesionBusiness?.business.id), representativeId:(RepCivil.id),bStoreIds: StoreCheck.filter((e) => e.check).map((e) => Number(e.id))},
          header,
          setLoader
        );
  
        console.log(response)
        navigation.navigate('LoteSuccessPayment',response.lote);
  
        console.log({ ...FormCreateLote, getbStoreIds: StoreCheck.filter((e) => e.check).map((e) => e.id),type: "PRODUCTO",});
      } catch (error) {
        console.log(JSON.stringify(error));
      } 
    }
  };

  const getBstores = useCallback(async () => {
    try {
      const host = process.env.APP_BASE_API;
      const url = `/services/cuponservices/api/b-stores?businessId.equals=${SesionBusiness?.business.id}&page=0&size=1000`;
      const header = await GetHeader(TokenAuthApi, 'application/json');
      const response: Stores[] = await HttpService('get', host, url, {}, header, setLoader);

      setStoreCheck(response.map((e) => ({ ...e, check: false })));
    } catch (error) {
      console.log(JSON.stringify(error));
    }
  }, [TokenAuthApi]);
  const getPayCupon = useCallback(async () => {
    try {
      const host = process.env.APP_BASE_API;
      const url = `/services/cuponservices/api/cuponapp/getConfig`;
      const header = await GetHeader(TokenAuthApi, 'application/json');
      const response: ValidateResponse = await HttpService('get', host, url, {}, header, setLoader);
      setPayCupon(response.value);
    } catch (error) {
      console.log(JSON.stringify(error));
    }
  }, [TokenAuthApi]);

  const Check = (e: StoreSelection) => {
    const list = StoreCheck.map((item) => (item.id === e.id ? { ...item, check: !item.check } : item))
    setStoreCheck(list);
  };
  const CheckAll = () => {
    const list = StoreCheck.map((item) => ({ ...item, check: !SelectAll }))
    setStoreCheck(list);
    setSelectAll(!SelectAll);
  };

  useEffect(() => {
    getBstores();
    setSelectAll(false);
    getPayCupon();
  }, []);
  useEffect(() => {
    const validate = StoreCheck.some(e => e.check)
    if(validate){
      setCanSend(true)
    }else{
      setCanSend(false)
    }
  }, [StoreCheck]);

  return (
    <>
      <View className="flex-row justify-between items-center w-full px-2 pr-4  h-[15%] bg-white ">
        <TouchableOpacity className=" flex-row items-center z-10" onPress={() => navigation.goBack()}>
          <FontAwesome5 name="chevron-left" size={28} color="black" />
        </TouchableOpacity>
      </View>

      <View className=" bg-white flex-1 items-center">
        <View className=" w-full h-full px-3 ">
          <Text style={[font.Bold, { fontSize: 20 }]}>Selecciona las Tiendas</Text>
          <TouchableOpacity
            onPress={() => {
              CheckAll();
            }}
          >
            <ListItem bottomDivider>
              <ListItem.CheckBox
                // Use ThemeProvider to change the defaults of the checkbox
                iconType="material-community"
                checkedIcon="checkbox-marked"
                uncheckedIcon="checkbox-blank-outline"
                checked={SelectAll}
              />
              <ListItem.Content>
                <ListItem.Title style={{ ...font.SemiBold, fontSize: 14 }}>
                  Seleccionar Todas las tiendas
                </ListItem.Title>
              </ListItem.Content>
            </ListItem>
          </TouchableOpacity>
          <FlatList
            data={StoreCheck}
            initialNumToRender={3}
            maxToRenderPerBatch={3}
            keyExtractor={(item) => (item.id ? item.id.toString() : '0')}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                onPress={() => {
                  Check(item);
                }}
              >
                <ListItem bottomDivider>
                  <ListItem.CheckBox
                    // Use ThemeProvider to change the defaults of the checkbox
                    iconType="material-community"
                    checkedIcon="checkbox-marked"
                    uncheckedIcon="checkbox-blank-outline"
                    checked={item.check}
                    onPress={() => {
                      Check(item);
                    }}
                  />
                  <ListItem.Content className=" w-full">
                    <ListItem.Title style={{ ...font.SemiBold, fontSize: 14 }}>{item.name}</ListItem.Title>
                    <ListItem.Subtitle style={{ ...font.SemiBold, fontSize: 10 }}>{item.email}</ListItem.Subtitle>
                  </ListItem.Content>
                </ListItem>
              </TouchableOpacity>
            )}
            style={{ backgroundColor: '#FFF' }}
            ListEmptyComponent={
              <Text className=" text-center w-full h-full " style={font.Bold}>
                No Hay Transacciones
              </Text>
            }
          />
        </View>
      </View>
      <View className=" absolute z-10 bottom-[2%] right-4 ">
        <FAB
          icon={(() => <FontAwesome name="send" size={24} color="white" />) as any}
          color="green"
          disabled={!CanSend}
          onPress={() => {
            sendData();
            /* navigation.navigate('LoteSelectPaymentMethod'); */
          }}
        />
      </View>
    </>
  );
};

export default LoteTiendasSelect;
