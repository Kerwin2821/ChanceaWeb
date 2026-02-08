import { View, Text, Platform, ScrollView } from "react-native";
import React, { JSX, useState } from "react";
import { font } from "../../../styles";
import Button from "../../components/ButtonComponent/Button";
import { useNavigation } from "@react-navigation/native";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import { CheckBox } from "@rn-vui/themed";

const TerminosCondicionesEULA = () => {
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const [Read, setRead] = useState(false);
  const [Acepte, setAcepte] = useState(false);

  const send = async () => {
   /*  if (Platform.OS === "ios") {
      navigation.push("Login");
      return;
    } */

    navigation.push("Prelogin");
  };

  const splitTextIntoParagraphs = (text: string): JSX.Element[] => {
    // Dividir el texto en frases usando el punto como delimitador
    return text
      .split(".")
      .filter((sentence) => sentence.trim() !== "")
      .map((sentence, index) => (
        <Text key={index} style={[font.Bold, { fontSize: 14, textAlign: "auto", marginBottom: 10 }]}>
          {sentence.trim() + "."}
        </Text>
      ));
  };

  return (
    <View className=" flex-1 pt-10 px-5 bg-white">
      <Text style={font.Bold} className=" text-base mt-10 mb-5 text-center">
        Términos y Condiciones y Acuerdo de Licencia de Usuario Final (EULA) de Chancea
      </Text>
      <View className=" h-[50%] p-3 rounded-lg border border-gray-400">
        <ScrollView>
          {splitTextIntoParagraphs(
            'Términos de Servicio (EULA) de Chancea. \
            Fecha de última actualización: 21 de agosto de 2024.\
            Este End-User License Agreement ("Acuerdo") es un acuerdo legal entre usted ("Usuario") y Chancea para el uso de la aplicación Chancea.\
            1 Licencia.\
            Chancea le otorga una licencia limitada, no exclusiva, no transferible y revocable para usar la aplicación ("App") únicamente para su uso personal y no comercial. No está permitido copiar, modificar, distribuir, vender o alquilar ninguna parte de la App.\
            2 Restricciones de Uso.\
            No debe decompilar, desensamblar ni intentar obtener el código fuente de la App. Tampoco debe usar la App para ningún propósito ilegal o no autorizado.\
            3 Actualizaciones.\
            Chancea puede proporcionar actualizaciones que deben instalarse para continuar usando la App. Estas actualizaciones pueden incluir mejoras, nuevas funciones o correcciones de errores.\
            4 Contenido Generado por el Usuario.\
            Usted conserva todos los derechos sobre su contenido, pero otorga a Chancea una licencia para usar, modificar y distribuir dicho contenido con el fin de operar la App. Debe asegurarse de que su contenido no infrinja los derechos de terceros.\
            5 Términos de Terceros.\
            La App puede incluir enlaces a sitios web o servicios de terceros que no están bajo nuestro control. No somos responsables del contenido ni de las políticas de privacidad de estos sitios o servicios.\
            6 Rescisión.\
            Este Acuerdo estará vigente hasta que usted o Chancea lo rescindan. Chancea puede rescindir este Acuerdo en cualquier momento si usted incumple los términos aquí establecidos. Al finalizar el Acuerdo, debe dejar de usar la App y eliminar todas las copias.\
            7 Exención de Garantías.\
            La App se proporciona "tal cual" y "según disponibilidad". Chancea no garantiza que la App estará libre de errores, que será segura o que funcionará sin interrupciones.\
            8 Limitación de Responsabilidad.\
            Chancea no será responsable de ningún daño indirecto, incidental, especial, consecuente o punitivo derivado de su uso de la App.\
            9 Ley Aplicable.\
            Este Acuerdo se rige por las leyes de la República Bolivariana de Venezuela. Cualquier disputa relacionada con este Acuerdo se resolverá en los tribunales de Caracas, Venezuela.'
          )}
        </ScrollView>
      </View>

      <View>
        <CheckBox checked={Read} onPress={() => setRead(!Read)} title="He leído los términos y condiciones" />
        <CheckBox checked={Acepte} onPress={() => setAcepte(!Acepte)} title="Acepto los términos y condiciones" />
      </View>

      <View className="absolute bottom-4 w-screen justify-center items-center">
        <View className=" w-[90%] ">
          <Button disabled={!Read || !Acepte} text="Continuar" onPress={() => send()} />
        </View>
      </View>
    </View>
  );
};

export default TerminosCondicionesEULA;
