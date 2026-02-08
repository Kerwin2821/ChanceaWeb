import { View, Text } from "react-native";
import React, { useMemo, useState } from "react";
import DialogReport from "../Dialog/DialogReport/DialogReport";
import DialogBloquear from "../Dialog/DialogBloquear/DialogBloquear";
import { ListItem, Dialog } from "@rn-vui/themed";
import DialogDeleteMatch from "../Dialog/DialogDeleteMatch/DialogDeleteMatch";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import { AntDesign, Entypo, Feather } from "@expo/vector-icons";
import { Colors } from "../../utils";
import { BottomTabNavigationType } from "../../navigation/BottomTab";
import { useStore } from "../../context/storeContext/StoreState";

const backList = [
  "MessaginScreen",
  "CustomerProfile"
]

type props = {
  active: boolean;
  setActive: (e: boolean) => void;
  data: { idDestino: string };
  navigation?: NavigationScreenNavigationType;
  onSuccess?: () => void;
};

const OptionsBaseCustomers = ({ active, setActive, data, onSuccess }: props) => {
  const [isVisibleReport, setIsVisibleReport] = useState(false);
  const [isVisibleBlock, setIsVisibleBlock] = useState(false);
  const [isVisibleDeleteM, setIsVisibleDeleteM] = useState(false);
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const navigationBottom = useNavigation<BottomTabNavigationType>();
  const route = useRoute();
  const { Match } = useStore();
  const usuario = useMemo(() => Match && Match.some(e => e.id === Number(data.idDestino)), [data, Match])


  const switchModal = (targetModalSetter: (value: boolean) => void) => {
    setActive(false); // 1. Cierra el BottomSheet primero
    setTimeout(() => {
      targetModalSetter(true); // 2. Abre el Dialog después de que el BottomSheet se haya ido
    }, 500); // 500ms de espera
  };

  return (
    <>
      <DialogReport
        active={isVisibleReport}
        setActive={setIsVisibleReport}
        data={data}
        navigation={navigation}
        back={backList.includes(route.name)}
        onSuccess={onSuccess}
      />
      <DialogBloquear
        active={isVisibleBlock}
        setActive={setIsVisibleBlock}
        data={data}
        navigation={navigation}
        back={backList.includes(route.name)}
        onSuccess={onSuccess}
      />
      <DialogDeleteMatch
        active={isVisibleDeleteM}
        setActive={setIsVisibleDeleteM}
        data={data}
        navigation={navigationBottom}
      />

      <Dialog isVisible={active} onBackdropPress={() => setActive(false)}>
        <View className="bg-white rounded-lg">
          <ListItem
            onPress={() => {
              switchModal(setIsVisibleReport)
            }}
          >
            <Feather name="alert-circle" size={24} color={Colors.yellow} />
            <ListItem.Content>
              <ListItem.Title>Reportar</ListItem.Title>
            </ListItem.Content>
          </ListItem>
          <ListItem
            onPress={() => {
              switchModal(setIsVisibleBlock)
            }}
          >
            <Entypo name="block" size={24} color="red" />
            <ListItem.Content>
              <ListItem.Title>Bloquear</ListItem.Title>
            </ListItem.Content>
          </ListItem>
          {usuario ? (
            <ListItem
              onPress={() => {
                switchModal(setIsVisibleDeleteM)
              }}
            >
              <AntDesign name="deleteusergroup" size={24} color="green" />
              <ListItem.Content>
                <ListItem.Title>Cancelar Match</ListItem.Title>
              </ListItem.Content>
            </ListItem>
          ) : null}

          <ListItem
            onPress={() => {
              setActive(false);
            }}
          >
            <AntDesign name="close" size={24} color="black" />
            <ListItem.Content>
              <ListItem.Title>Cancelar</ListItem.Title>
            </ListItem.Content>
          </ListItem>
        </View>
      </Dialog>
    </>
  );
};

export default OptionsBaseCustomers;
