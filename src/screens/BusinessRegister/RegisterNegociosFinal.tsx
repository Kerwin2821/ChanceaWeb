import { Text, View, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Dimensions } from "react-native"
import { Colors } from "../../utils"
import { useNavigation } from "@react-navigation/native"
import type { NavigationScreenNavigationType } from "../../navigation/StackNavigator"
import Button from "../../components/ButtonComponent/Button"
import { FontAwesome5, Feather, MaterialIcons } from "@expo/vector-icons"
import { font } from "../../../styles"

const { width, height } = Dimensions.get("window")

export default function RegisterNegociosFinal() {
  const navigation = useNavigation<NavigationScreenNavigationType>()

  return (
    <View className="h-full" style={{ backgroundColor: "white" }}>


      {/* Header - Using percentage width */}
      <View
        style={{
          width: "100%",
          backgroundColor: Colors.primary,
          paddingTop: height * 0.05,
          paddingBottom: height * 0.03,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
          marginBottom: height * 0.02,
        }}
      >
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <View
            style={{
              width: width * 0.18,
              height: width * 0.18,
              backgroundColor: "white",
              borderRadius: width * 0.09,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: height * 0.02,
            }}
          >
            <FontAwesome5 name="check" size={width * 0.08} color={Colors.primary} />
          </View>
          <Text
            style={[
              font.Bold,
              {
                color: "white",
                fontSize: Math.min(width * 0.06, 24),
                textAlign: "center",
                paddingHorizontal: width * 0.05,
              },
            ]}
          >
            ¡Registro Exitoso!
          </Text>
        </View>
      </View>

      {/* Main Content - Using flexible sizing */}
      <View
        style={{
          flex: 1,
          paddingHorizontal: width * 0.05,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Success Message */}
        <View style={{ width: "100%", marginBottom: height * 0.03 }}>
          <Text
            style={[
              font.SemiBold,
              {
                fontSize: Math.min(width * 0.05, 20),
                textAlign: "center",
                color: Colors.secondary,
                marginBottom: height * 0.01,
              },
            ]}
          >
            ¡Felicidades! Ya eres parte de nuestra Comunidad
          </Text>

          <View
            style={{
              backgroundColor: "#e6f7e6",
              padding: width * 0.04,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#c3e6cb",
              marginTop: height * 0.02,
            }}
          >
            <Text
              style={[
                font.Regular,
                {
                  fontSize: Math.min(width * 0.04, 16),
                  color: "#2c5f2d",
                  textAlign: "center",
                },
              ]}
            >
              Bienvenido a Chancea, gracias por unirte como uno de nuestros aliados. Podrás gestionar tu negocio de forma eficiente.
            </Text>
          </View>
        </View>

        {/* Benefits Section - Simplified for better responsiveness */}
        <View
          style={{
            width: "100%",
            backgroundColor: "#f9f9f9",
            borderRadius: 12,
            padding: width * 0.04,
            marginBottom: height * 0.03,
          }}
        >
          <Text
            style={[
              font.SemiBold,
              {
                fontSize: Math.min(width * 0.045, 18),
                color: Colors.secondary,
                marginBottom: height * 0.02,
              },
            ]}
          >
            Lo que puedes hacer ahora:
          </Text>

          {/* Benefit Item 1 */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: height * 0.015,
            }}
          >
            <View
              style={{
                width: width * 0.08,
                height: width * 0.08,
                borderRadius: width * 0.04,
                backgroundColor: "rgba(var(--color-primary), 0.1)",
                alignItems: "center",
                justifyContent: "center",
                marginRight: width * 0.03,
              }}
            >
              <FontAwesome5 name="store" size={width * 0.04} color={Colors.primary} />
            </View>
            <Text
              style={[
                font.Regular,
                {
                  flex: 1,
                  fontSize: Math.min(width * 0.035, 14),
                  color: "#4a4a4a",
                },
              ]}
            >
              Configurar tu perfil de negocio
            </Text>
          </View>


          {/* Benefit Item 3 */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: width * 0.08,
                height: width * 0.08,
                borderRadius: width * 0.04,
                backgroundColor: "rgba(var(--color-primary), 0.1)",
                alignItems: "center",
                justifyContent: "center",
                marginRight: width * 0.03,
              }}
            >
              <Feather name="users" size={width * 0.04} color={Colors.primary} />
            </View>
            <Text
              style={[
                font.Regular,
                {
                  flex: 1,
                  fontSize: Math.min(width * 0.035, 14),
                  color: "#4a4a4a",
                },
              ]}
            >
              Conectar con nuevos clientes
            </Text>
          </View>
        </View>

        {/* Action Buttons - Using percentage width */}
        <View style={{ width: "90%", marginTop: height * 0.02 }}>
          <Button
            text="Iniciar Sesión"
            onPress={() => navigation.navigate("LoginBusiness")}
            styleText={{ fontFamily: "Bold", fontSize: Math.min(width * 0.04, 16) }}
          />

          <TouchableOpacity
            style={{
              marginTop: height * 0.02,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: height * 0.015,
            }}
            onPress={() => navigation.navigate("Prelogin")}
          >
            <Feather name="home" size={width * 0.04} color={Colors.secondary} />
            <Text
              style={[
                font.SemiBold,
                {
                  marginLeft: width * 0.02,
                  color: Colors.secondary,
                  fontSize: Math.min(width * 0.035, 14),
                },
              ]}
            >
              Volver al Inicio
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

