import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import ScreenContainer from '../../../components/ScreenContainer';
import { useAuth, useRender } from '../../../context';
import { GetHeader, ToastCall } from '../../../utils/Helpers';
import { HttpService } from '../../../services';
import { Items } from '../../../utils/Interface';
import { font } from '../../../../styles';
import Select from '../../../components/Select/SelectComponent';
import Input from '../../../components/InputComponent/Input';
import Button from '../../../components/ButtonComponent/Button';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RegisterLoginScreenNavigationType } from '../../../navigation/StackNavigation';
import { DrawerNavigationBusinessType } from '../../../navigation/DrawerNavBusiness';
import InputPhoneNumber from '../../../components/InputPhoneNumber/InputPhoneNumber';
import { useStoreBusiness } from '../../../context/storeContextBusiness/StoreBusinessState';
import { Business } from '../../../context/authContext/AuthInterface';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons';

const generos: Items[] = [
  {
    label: 'Masculino',
    value: 'MASCULINO'
  },
  {
    label: 'Femenino',
    value: 'FEMENINO'
  }
  /*   {
    label: 'Otros',
    value: 'OTROS'
  } */
];

let regex = /^[A-Za-zÑñ0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i;
const regexTelefonoVenezolano =
  /^(412|414|416|424|413|415|426|426|428|426|424|416|426|413|412|415|414|412|416|412|426|426|428|426|424|416|426|413|412|415|414|412|416|412|426|426|428|426|424|416|426|413|412|415|414|412|416|412|426|426|428|426|424|416|426|413|412|415|414)\d{7}$/;

const documents = [
  {
    value: 'J',
    label: 'J'
  },
  {
    value: 'V',
    label: 'V'
  },
  {
    value: 'E',
    label: 'E'
  },
  {
    value: 'P',
    label: 'P'
  },
  {
    value: 'G',
    label: 'G'
  }
];

const formRespresentanteInit = {
  name: '',
  lastName: '',
  phoneNumber: '',
  email: '',
  gender: 'MASCULINO',
  conditionType: 'V',
  identificationNumber: '',
  representativeStatus: "ACTIVE",
  creationDate: new Date().toISOString()
};

export interface Respresentante {
  id?: '';
  name: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  gender: string;
  conditionType: string;
  identificationNumber: string;
  representativeStatus: string;
  creationDate: string;
  business: Business;
}

const RepresentanteForm = () => {
  const [token, setToken] = useState<string | null>(null);
  const [representatives, setRepresentatives] = useState<any[]>([]);
  const [newRep, setNewRep] = useState(formRespresentanteInit);
  const { RepCivil, setRepCivil} = useStoreBusiness();
  const { TokenAuthApi, SesionBusiness } = useAuth();
  const { setLoader } = useRender();
  const navigation = useNavigation<RegisterLoginScreenNavigationType>();
  const navigationDrawer = useNavigation<DrawerNavigationBusinessType>();
  const route = useRoute();
  const data = route.params as { Representante: Respresentante } | undefined;
  const [isNumberPhone, setIsNumberPhone] = useState<boolean | 'pending'>('pending');
  const [isCorreo, setIsCorreo] = useState<boolean | 'pending'>('pending');

  async function sendCreate() {
    try {
      const host = process.env.APP_BASE_API;
      const url = `/services/cuponservices/api/representatives`;
      const header = await GetHeader(TokenAuthApi, 'application/json');
      console.log(newRep);
      const response = await HttpService(
        'post',
        host,
        url,
        { ...newRep, business: SesionBusiness?.business, },
        header,
        setLoader
      );
      /* const reps = await fetchRepresentatives(TokenAuthApi);
      setRepresentatives(reps); */
      setNewRep(formRespresentanteInit);
      await AsyncStorage.setItem('RepCivil', JSON.stringify(response));
      setRepCivil(response)
      navigation.navigate("HomeBusiness")
    } catch (err: any) {
      console.error(JSON.stringify(err));
      if (err && err?.status) {
        ToastCall('error', 'error de conexion en con el Servidor', 'ES');
      } else {
        ToastCall('error', 'Tienes problemas de conexion', 'ES');
      }
    } // Displaying the stringified data in an alert popup
  }

  async function sendUpdate() {
    try {
      if (!RepCivil || !RepCivil.id) return;
      const host = process.env.APP_BASE_API;
      const url = `/services/cuponservices/api/representatives/${RepCivil.id}`;
      const header = await GetHeader(TokenAuthApi, 'application/json');
      const response = await HttpService('put', host, url, newRep, header, setLoader);
      
      await AsyncStorage.setItem('RepCivil', JSON.stringify(response));
      setRepCivil(response)
      setNewRep(response);
      ToastCall('success', 'Representante legal actualizado con éxito.', 'ES');
      navigation.goBack();
    } catch (err: any) {
      console.error(JSON.stringify(err));
      if (err && err?.status) {
        ToastCall('error', 'error de conexion en con el Servidor', 'ES');
      } else {
        ToastCall('error', 'Tienes problemas de conexion', 'ES');
      }
    } // Displaying the stringified data in an alert popup
  }

  const change = useCallback(
    (value: string | number, key: string | number) => {
      setNewRep({
        ...newRep,
        [key]: value
      });
    },
    [newRep]
  );

  useEffect(() => {
    if (RepCivil) {
      setNewRep(RepCivil)
    }
  }, [RepCivil]);
  useEffect(() => {
    if (newRep.email) {
      setIsCorreo(regex.test(newRep.email));
    }
  }, [newRep.email]);
  useEffect(() => {
    if (newRep.phoneNumber) {
      setIsNumberPhone(regexTelefonoVenezolano.test(newRep.phoneNumber.slice(3)));
    }
  }, [newRep.phoneNumber]);
  useEffect(() => {
    setNewRep(formRespresentanteInit);
  }, []);

  return (
    <ScreenContainer>
      <View className=" flex-1  bg-white px-4">
      <View className=" items-start bg-white">
        <TouchableOpacity className=" items-center z-10 " onPress={() => navigation.goBack()}>
          <FontAwesome5 name="chevron-left" size={28} color="black" />
        </TouchableOpacity>
      </View>
      <View className=" h-auto w-full  mt-5">
        <Text style={styles.title}>Representante Legal</Text>
      </View>
        <View className=" w-full justify-center items-center gap-2">
          <View className=" w-full px-2">
            <Text style={font.SemiBold}>Cedula</Text>
          </View>
          <View className=" flex-row w-full justify-between items-center">
            <View style={{ width: '30%' }}>
              <Select
                items={documents}
                onChange={(e: string | number) => change(e, 'conditionType')}
                lengthText={12}
                styleText={{ paddingHorizontal: 0 }}
                value={newRep.conditionType}
              />
            </View>
            <View style={{ width: '65%' }}>
              <Input
                placeholder={'Ejemplo: 12110977'}
                onChangeText={(e: string) => change(e.replace(/[^0-9a-zA-Z]/g, ''), 'identificationNumber')}
                value={newRep.identificationNumber}
                keyboardType="numeric"
                maxLength={9}
              />
            </View>
          </View>
          <View className="w-full justify-center items-center ">
            <InputPhoneNumber
              labelText="Numero de Telefono"
              keyboardType="default"
              value={newRep.phoneNumber}
              onChangeText={(e: string) => {
                if (e.length < 15) change(e, 'phoneNumber');
              }}
            />
          </View>
          {newRep.phoneNumber.slice(0, 3) === '+58' ? (
            !isNumberPhone ? (
              <Text className=" text-xs text-red-400 text-left w-[70%]" style={font.Regular}>
                No es un Numero de telefono
              </Text>
            ) : null
          ) : null}
          <View className="w-full justify-center items-center ">
            <Input
              labelText="Nombres"
              placeholder="nombre"
              keyboardType="default"
              value={newRep.name}
              maxLength={50}
              onChangeText={(e: string) => change(e, 'name')}
            />
          </View>

          <View className="w-full justify-center items-center ">
            <Input
              labelText="Apellidos"
              placeholder="apellidos"
              keyboardType="default"
              value={newRep.lastName}
              maxLength={50}
              onChangeText={(e: string) => change(e, 'lastName')}
            />
          </View>
          <View className="w-full justify-center items-center ">
            <Input
              labelText="Correo Electrónico"
              placeholder="correo@gmail.com"
              keyboardType="email-address"
              value={newRep.email}
              maxLength={50}
              onChangeText={(e: string) => {
                change(e, 'email');
              }}
            />
          </View>
          {!isCorreo ? (
            <Text className=" text-xs text-red-400 text-left w-[70%]" style={font.Regular}>
              No es un Email
            </Text>
          ) : null}

          <View className="w-full justify-center items-center ">
            <Select
              items={generos}
              labelText="Genero"
              value={newRep.gender}
              onChange={(e: string | number) => change(e, 'gender')}
            />
          </View>
        </View>

        <View className="w-full flex-row justify-center px-5 mt-10 ">
          <View className="w-[45%] items-center">
            <Button
              text={RepCivil ? 'Editar' : 'Guardar'}
              disabled={!newRep.gender || !newRep.lastName || !newRep.identificationNumber || !newRep.name}
              onPress={() => {
                if (RepCivil) {
                  sendUpdate();
                } else {
                  sendCreate();
                }
              }}
            />
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
};

export default RepresentanteForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  title: {
    fontSize: 20,
    fontFamily: 'Bold',
    marginBottom: 16
  },
  repContainer: {
    marginBottom: 16
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 8
  }
});
