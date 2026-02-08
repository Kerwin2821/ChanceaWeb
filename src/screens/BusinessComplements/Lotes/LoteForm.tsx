import { View, Text, TouchableOpacity } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenContainer from '../../../components/ScreenContainer';
import { useStoreBusiness } from '../../../context/storeContextBusiness/StoreBusinessState';
import { useAuth, useRender } from '../../../context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RegisterLoginScreenNavigationType } from '../../../navigation/StackNavigation';
import { DrawerNavigationBusinessType } from '../../../navigation/DrawerNavBusiness';
import { Respresentante } from '../Representante/RepresentanteForm';
import { FontAwesome5 } from '@expo/vector-icons';
import { font, label } from '../../../../styles';
import Input from '../../../components/InputComponent/Input';
import Button from '../../../components/ButtonComponent/Button';
import moment from 'moment';
import { GetHeader, ToastCall } from '../../../utils/Helpers';
import { HttpService } from '../../../services';
import Select from '../../../components/Select/SelectComponent';
import { CategoryData, Items } from '../../../utils/Interface';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import { CheckBox, ListItem } from '@rn-vui/themed';
import DatePicker from 'react-native-date-picker';
import { useStore } from '../../../context/storeContext/StoreState';

const LoteForm = () => {
  const [token, setToken] = useState<string | null>(null);
  const [representatives, setRepresentatives] = useState<any[]>([]);
  const { RepCivil, setRepCivil } = useStoreBusiness();
  const { TokenAuthApi, SesionBusiness } = useAuth();
  const { setLoader } = useRender();
  const { FormCreateLote, setFormCreateLote, Stores, setStores } = useStoreBusiness();
  const { DataCategory,setDataCategory } = useStore();
  const navigation = useNavigation<RegisterLoginScreenNavigationType>();
  const navigationDrawer = useNavigation<DrawerNavigationBusinessType>();
  const route = useRoute();
  const data = route.params as { Representante: Respresentante } | undefined;
  const [isDateInit, setisDateInit] = useState(false);
  const [CategoryDataItems, setCategoryDataItems] = useState<Items[]>([]);
  const [DateInit, setDateInit] = useState(new Date(new Date().getTime()));
  const [DateEnd, setDateEnd] = useState(new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000));
  const [DateExp, setDateExp] = useState(new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000));
  const [open, setOpen] = useState(false);
  const [openExp, setOpenExp] = useState(false);
  const [check1, setCheck1] = useState(true);

  const change = useCallback(
    (value: string | number, key: string | number) => {
      setFormCreateLote({
        ...FormCreateLote,
        [key]: value
      });
    },
    [FormCreateLote]
  );

  const sendData = () => {
    if(FormCreateLote.quantiTy > 200){
      ToastCall('warning', 'No se pueden generar más de 200 cupones', 'ES');
      return 
    }
    setFormCreateLote({...FormCreateLote,expirationDate:DateExp.toISOString(),auctionTime:DateInit.toISOString(), endAuctionTime:DateEnd.toISOString()})
    navigation.navigate('LoteTiendasSelect')
  }

  const getBstores = useCallback(async () => {
    try {
      const host = process.env.APP_BASE_API;
      const url = `/services/cuponservices/api/b-stores?businessId.equals=${SesionBusiness?.business.id}&page=0&size=1000`;
      const header = await GetHeader(TokenAuthApi, 'application/json');
      const response = await HttpService('get', host, url, {}, header, setLoader);

      console.log(response);

      setStores(response);
    } catch (error) {
      console.log(JSON.stringify(error));
    }
  }, [TokenAuthApi]);

  async function getCategory() {
    try {
      const host = process.env.APP_BASE_API;
      const url = `/services/cuponservices/api/categories?page=0&size=30`;
      const header = await GetHeader(TokenAuthApi, 'application/json');
      const response: CategoryData[] = await HttpService('get', host, url, {}, header, setLoader);
      setDataCategory(response)
      setCategoryDataItems(response.map((e) => ({ value: e.id, label: e.name })));
    } catch (err: any) {
      console.error(JSON.stringify(err));
      if (err && err?.status) {
        ToastCall('error', 'error de conexion en con el Servidor', 'ES');
      } else {
        ToastCall('error', 'Tienes problemas de conexion', 'ES');
      }
    } // Displaying the stringified data in an alert popup
  }

  useEffect(() => {
    getCategory();
    getBstores();
  }, []);

  return (
    <SafeAreaView className=" flex-1 bg-white">
      <ScrollView>
        <View className="px-5 items-start bg-white">
          <TouchableOpacity className=" items-center z-10 " onPress={() => navigation.goBack()}>
            <FontAwesome5 name="chevron-left" size={28} color="black" />
          </TouchableOpacity>
        </View>
        <View className=" my-3">
          <Text style={{ ...label.label, fontSize: 24 }}> {'Crear Lote'}</Text>
        </View>
        <View className=" flex-1 px-5 w-full bg-white">
          <View className="w-full justify-center items-center mb-2">
            <Input
              labelText="Titulo del lote"
              placeholder="10% de descuento"
              keyboardType="default"
              value={FormCreateLote.name}
              maxLength={50}
              onChangeText={(e: string) => change(e, 'name')}
            />
          </View>
          <View className="w-full justify-center items-center  ">
            <Input
              labelText="Descripción de cupon"
              placeholder="Una oferta de descuento que no te puedes perder..."
              keyboardType="default"
              value={FormCreateLote.description}
              multiline
              styleInput={{ fontSize: 12 }}
              maxLength={250}
              onChangeText={(e: string) => change(e, 'description')}
            />
          </View>
          <View className="w-full justify-center items-center mb-5 ">
            <Select
              items={CategoryDataItems}
              labelText="Categoria"
              onChange={(e: string | number) => change(e, 'categoryId')}
              lengthText={13}
              styleText={{ paddingHorizontal: 0 }}
              value={FormCreateLote.categoryId}
            />
          </View>

          <Text style={label.label}> Fecha de subasta.</Text>
          <View className=" flex-row justify-center gap-x-3 ">
            <View className=" w-[50%]">
              <Button
                typeButton="white"
                text={'Ini: ' + moment(DateInit.toISOString()).format('DD/MM/YYYY')}
                disabled={check1}
                onPress={() => {
                  setisDateInit(true), setOpen(true);
                }}
              />
            </View>
            <View className=" w-[50%]">
              <Button
                typeButton="white"
                text={'Fin: ' + moment(DateEnd.toISOString()).format('DD/MM/YYYY')}
                onPress={() => {
                  setisDateInit(false), setOpen(true);
                }}
              />
            </View>
          </View>
          <View className="w-full justify-center items-center mb-2 z-10">
            <CheckBox
              center
              title="Inicio de subasta (Ahora Mismo)"
              checked={check1}
              onPress={() => setCheck1(!check1)}
            />
          </View>
          
          <Text style={label.label}> Fecha de expiración</Text>
          <View className=" flex-row justify-center gap-x-3 ">
            <View className=" w-[80%]">
              <Button
                typeButton="white"
                text={'Ini: ' + moment(DateExp.toISOString()).format('DD/MM/YYYY')}
                onPress={() => {
                  setOpenExp(true);
                }}
              />
            </View>
          </View>

          <View className="w-full justify-center items-center mb-2 z-10">
            <CheckBox
              center
              title="El cupón es Grátis"
              checked={FormCreateLote.free}
              onPress={() =>
                setFormCreateLote({
                  ...FormCreateLote,
                  free: !FormCreateLote.free,
                  isFree: !FormCreateLote.free,
                  amount: !FormCreateLote.free ? 0 : FormCreateLote.amount,
                  previousCost: !FormCreateLote.free ? 0 : FormCreateLote.previousCost
                })
              }
            />
          </View>
          <View className=" flex-row gap-x-3">
            <View className="w-[45%] justify-center items-center mb-2 ">
              <Input
                labelText="Precio de oferta"
                placeholder="0$"
                keyboardType="numeric"
                value={FormCreateLote.amount.toString()}
                maxLength={50}
                onChangeText={(e: string) => change(e, 'amount')}
                disabled={FormCreateLote.free}
              />
            </View>
            <View className="w-[45%] justify-center items-center mb-2 ">
              <Input
                labelText="Precio Anterior"
                placeholder="0$"
                keyboardType="numeric"
                value={FormCreateLote.previousCost.toString()}
                maxLength={50}
                onChangeText={(e: string) => change(e, 'previousCost')}
                disabled={FormCreateLote.free}
              />
            </View>
          </View>
          <View className="w-full justify-center items-center mb-2 ">
            <Input
              labelText="Cantidad de cupones"
              placeholder="0"
              keyboardType="numeric"
              value={FormCreateLote.quantiTy.toString()}
              maxLength={50}
              onChangeText={(e: string) => change(e, 'quantiTy')}
            />
          </View>

          <DatePicker
            modal
            theme="dark"
            title=" "
            open={open}
            date={isDateInit ? DateInit : DateEnd}
            mode="date"
            minimumDate={new Date()}
            textColor="#FFF"
            confirmText="Cambiar"
            onConfirm={(date) => {
              setOpen(false);
              console.log(date);
              isDateInit ? setDateInit(date) : setDateEnd(date);
            }}
            onCancel={() => {
              setOpen(false);
            }}
          />
          <DatePicker
            modal
            theme="dark"
            title=" "
            open={openExp}
            date={DateExp}
            mode="date"
            minimumDate={new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000)}
            textColor="#FFF"
            confirmText="Cambiar"
            onConfirm={(date) => {
              setOpenExp(false);
              setDateExp(date);
            }}
            onCancel={() => {
              setOpen(false);
            }}
          />
        </View>
        <View className="w-full flex-row justify-center mt-5  ">
          <View className="w-[50%] items-center">
            <Button text={'Siguiente'} disabled={ !FormCreateLote.quantiTy || !FormCreateLote.name || !FormCreateLote.description } onPress={() => sendData()} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoteForm;
