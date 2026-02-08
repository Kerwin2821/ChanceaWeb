import { Text, View, StyleSheet, Platform } from "react-native";
import { Items } from "../../utils/Interface";
import Button from "../../components/ButtonComponent/Button";
import { height, width } from "../../utils/Helpers";
import Input from "../../components/InputComponent/Input";
import { useAuth, useFormRegister, useRender } from "../../context";
import { useCallback, useEffect, useState } from "react";
import Select from "../../components/Select/SelectComponent";
import { useNavigation, useRoute } from "@react-navigation/native";
import ScreenContainer from "../../components/ScreenContainer";
import { font } from "../../../styles";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import InputForm from "../../components/InputFormComponent/InputForm";
import RegisteIMG1 from "../../components/imgSvg/RegisteIMG1";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import SvgIMG1 from "../../components/imgSvg/svgIMG1";
import ScreenContainerForm from "../../components/ScreenContainerForm";

const generos: Items[] = [
  {
    label: "Masculino",
    value: "MASCULINO",
  },
  {
    label: "Femenino",
    value: "FEMENINO",
  },
  {
    label: "Otros",
    value: "OTHER",
  },
];

export default function RegisterScreen() {
  const {
    registerReq,
    registerReq: { gender },
    setRegisterReq,
    initialStateRegister,
    setIsGoogleRegister,
  } = useFormRegister();
  /* const { TokenAuthApi, deviceId,DataCoordenadas } = useAuth(); */
  const { setLoader } = useRender();
  const [DocumentType, setDocumentType] = useState<string>("V");
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const route = useRoute();
  const datos = route.params as { email: string; firstName?: string; lastName?: string };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      firstName: datos?.firstName || registerReq.firstName,
      lastName: datos?.lastName || registerReq.lastName,
    },
  });

  const NextStep: SubmitHandler<any> = (data) => {
    if (datos) setIsGoogleRegister(true);
    setRegisterReq({ ...registerReq, ...data, email: datos ? datos.email : "" });
    navigation.navigate("RegisterScreen1");
  };

  useEffect(() => {
    if (datos) {
      if (datos.firstName) change(datos.firstName, "firstName");
      if (datos.lastName) change(datos.lastName, "lastName");
    }
  }, [datos]);

  const change = useCallback(
    (value: string | number, key: string | number) => {
      setRegisterReq((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [setRegisterReq]
  );

  /*  useEffect(() => {
    setRegisterReq({
      ...registerReq,
      email:data.email
    });
  }, []); */

  useEffect(() => {
    setRegisterReq(initialStateRegister);
  }, []);

  return (
    <ScreenContainerForm>
      <View className="flex-1 w-full md:max-w-lg md:mx-auto justify-between pb-5">

        <View className="w-full justify-center items-center my-5">
          <View className="mb-2">
            <RegisteIMG1 width={Platform.OS === 'web' ? 180 : width * 0.35} height={Platform.OS === 'web' ? 180 : width * 0.35} />
          </View>
          <Text style={{ ...font.Bold, fontSize: 22, textAlign: 'center', color: '#333' }}>
            ¡Epa! Para que comiences
          </Text>
          <Text style={{ ...font.Bold, fontSize: 22, textAlign: 'center', color: '#333' }}>
            a chancear, completa tus datos.
          </Text>
        </View>

        <View className="w-full px-5 ">
          <View className="w-full mb-4">
            <InputForm
              labelText="Nombres"
              placeholder="Ingresa tu nombre"
              keyboardType="default"
              maxLength={50}
              onChangeText={(e: string) => change(e, "firstName")}
              control={control}
              name="firstName"
              rules={{
                required: "Nombres es requerido"
              }}
            />
          </View>

          <View className="w-full mb-4">
            <InputForm
              labelText="Apellidos"
              placeholder="Ingresa tu apellido"
              keyboardType="default"
              maxLength={50}
              onChangeText={(e: string) => change(e, "lastName")}
              control={control}
              name="lastName"
              rules={{
                required: "Apellidos es requerido",
              }}
            />
          </View>

          <View className="w-full mb-4">
            <Select
              items={generos}
              labelText="Género"
              value={gender}
              onChange={(e: string | number) => change(e, "gender")}
            />
          </View>
        </View>

        <View className="w-full flex-row justify-between px-5 mt-10">
          <View className="w-[48%]">
            <Button
              text={"Volver"}
              onPress={() => {
                navigation.goBack();
                setRegisterReq(initialStateRegister);
              }}
              typeButton="white"
            />
          </View>
          <View className="w-[48%]">
            <Button
              text={"Siguiente"}
              onPress={handleSubmit(NextStep)}
            />
          </View>
        </View>
      </View>
    </ScreenContainerForm>
  );
}
const styles = StyleSheet.create({
  container: {
    height,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    height: 150,
    borderRadius: 10,
    width: 150,
  },
});
