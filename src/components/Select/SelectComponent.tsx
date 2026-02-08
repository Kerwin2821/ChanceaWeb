import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  View,
  Platform,
  ViewStyle,
  ImageStyle,
  TextStyle,
  Pressable
} from "react-native";
import { Colors } from "../../utils";
import { Picker } from "@react-native-picker/picker";
import { AntDesign } from "@expo/vector-icons";
import Button from "../ButtonComponent/Button";
import { Items } from "../../utils/Interface";
import { font } from "../../../styles";

interface Props {
  items?: Items[];
  lengthText?: number;
  value: string | number | null;
  style?: ViewStyle;
  styleText?: TextStyle;
  styleIcons?: ImageStyle;
  onChange: (e: string | number) => void;
  labelText?: string;
  placeholder?: string;
}

const Select = ({
  items,
  lengthText,
  value,
  onChange,
  style,
  styleText,
  styleIcons,
  labelText,
  placeholder = "Selecciona",
}: Props) => {
  const itemsSelect: Items[] = items || [
    { value: "1", label: "Prueba" },
    { value: "2", label: "Prueba2" },
  ];

  // Estado local para manejar la selección
  const [selectedValue, setSelectedValue] = useState<string | number | null>(value);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [modal, setModal] = useState(false);

  // Función para encontrar la etiqueta por valor
  const findLabelByValue = useCallback((val: string | number | null): string | null => {
    if (val === null || val === "") return null;

    const item = itemsSelect.find(item => String(item.value) === String(val));
    return item?.label || null;
  }, [itemsSelect]);

  // Actualizar el estado cuando cambia el valor externo o los items
  useEffect(() => {
    const label = findLabelByValue(value);
    setSelectedValue(value);
    setSelectedLabel(label);
  }, [value, findLabelByValue]);

  const stylesComp = styleIcons ? [styles.icon, styleIcons] : styles.icon;

  // Función para obtener la etiqueta a mostrar
  const getDisplayLabel = useCallback(() => {
    // Si hay una etiqueta seleccionada, mostrarla
    if (selectedLabel) {
      // Aplicar truncamiento si es necesario
      if (lengthText && selectedLabel.length > lengthText) {
        return selectedLabel.substring(0, lengthText) + "...";
      }
      return selectedLabel;
    }

    // Si no hay etiqueta, mostrar el placeholder
    return placeholder;
  }, [selectedLabel, lengthText, placeholder]);

  // Manejar el cambio de valor
  const handleValueChange = (itemValue: string | number, itemIndex: number) => {
    // Ignorar la selección del placeholder
    if (itemValue === "") {
      setSelectedValue(null);
      setSelectedLabel(null);
      onChange("");
      return;
    }

    // Buscar el ítem seleccionado
    const selectedItem = itemsSelect.find(item => String(item.value) === String(itemValue));

    if (selectedItem) {
      // Actualizar estados locales
      setSelectedValue(itemValue);
      setSelectedLabel(selectedItem.label);

      // Notificar al componente padre
      onChange(itemValue);

      // En iOS, cerrar el modal después de seleccionar
      if (Platform.OS === "ios") {
        setModal(false);
      }
    }
  };

  // Renderizar el Picker
  const renderPicker = () => (
    <Picker
      selectedValue={selectedValue === null ? "" : selectedValue}
      onValueChange={handleValueChange}
      style={styles.select}
      itemStyle={styles.itemSelect}
      dropdownIconColor={"rgba(0,0,0,.3)"}
    >
      <Picker.Item
        key="placeholder"
        label={placeholder}
        value=""
        style={[font.Bold, styles.placeholderItem]}
      />
      {itemsSelect.map((item, index) => (
        <Picker.Item
          key={index.toString()}
          label={item.label}
          value={item.value}
          style={font.Bold}
        />
      ))}
    </Picker>
  );

  return (
    <>
      {labelText && <Text style={styles.label}>{labelText}</Text>}
      <Pressable
        style={[styles.container, style]}
        onPress={() => {
          (Platform.OS === "ios") && setModal(true);
        }}
      >
        <Text
          style={[
            styles.text,
            styleText,
            (!selectedValue) && styles.placeholderText
          ]}
          numberOfLines={1}
        >
          {getDisplayLabel()}
        </Text>
        <Pressable
          style={stylesComp}
          onPress={() => {
            (Platform.OS === "ios") && setModal(true);
          }}
        >
          <AntDesign name="down" size={24} color="black" />
        </Pressable>
        {Platform.OS !== "ios" && renderPicker()}
      </Pressable>

      {/* Modal para iOS */}
      <Modal animationType="slide" transparent={true} visible={modal}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {renderPicker()}
            <View style={styles.buttonContainer}>
              <Button
                onPress={() => setModal(false)}
                text={"Ok"}
                styleButton={{ marginBottom: 0 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: Colors.white,
    borderRadius: 50,
    borderStyle: "solid",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    position: "relative",
    height: 50,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  icon: {
    position: "absolute",
    width: 20,
    height: 20,
    right: "7%",
    top: "25%",
  },
  text: {
    color: Colors.black,
    fontSize: 16,
    textAlign: "left",
    width: "100%",
    paddingLeft: 16,
    paddingRight: 46,
    fontFamily: "Bold",
  },
  placeholderText: {
    color: '#999',
    fontStyle: 'italic',
  },
  placeholderItem: {
    color: '#999',
    fontStyle: 'italic',
  },
  select: {
    position: Platform.OS === "ios" ? "relative" : "absolute",
    width: "100%",
    height: Platform.OS === "ios" ? 200 : "100%",
    top: 0,
    left: 0,
    color: Colors.black,
    opacity: Platform.OS === "ios" ? 1 : 0,
  },
  itemSelect: {
    color: "black",
    fontFamily: "SemiBold",
    fontSize: 18,
  },
  centeredView: {
    flex: 1,
    justifyContent: "flex-end", // Cambiado para que aparezca desde abajo
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,.5)",
  },
  modalView: {
    width: "100%",
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 20,
    alignItems: "center",
    shadowColor: Colors.white,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonContainer: {
    width: "40%",
    marginTop: 10,
  },
  label: {
    width: "100%",
    color: Colors.black,
    fontSize: 14,
    fontFamily: "SemiBold",
    paddingLeft: 8,
    marginBottom: 4,
  },
});

export default Select;