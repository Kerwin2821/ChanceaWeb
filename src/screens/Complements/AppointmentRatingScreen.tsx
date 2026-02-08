import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { FontAwesome, FontAwesome5, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
  FadeInDown,
  FadeIn,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

// Local imports
import { font } from "../../../styles";
import { GetHeader, ToastCall } from "../../utils/Helpers";
import { useAuth, useRender } from "../../context";
import { Colors } from "../../utils";
import ScreenContainer from "../../components/ScreenContainer";
import type { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import CacheImage from "../../components/CacheImage/CacheImage";
import { HttpService } from "../../services";

// Define interfaces for the appointment data

const { width, height } = Dimensions.get("window");

// Rating descriptions
const BUSINESS_RATING_DESCRIPTIONS = [
  "Selecciona una calificación",
  "Muy malo",
  "Malo",
  "Regular",
  "Bueno",
  "Excelente",
];

const PERSON_RATING_DESCRIPTIONS = [
  "Selecciona una calificación",
  "Muy mala experiencia",
  "Mala experiencia",
  "Experiencia regular",
  "Buena experiencia",
  "Excelente experiencia",
];

const AppointmentRatingScreen = () => {
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const route = useRoute();
  const appointmentData = route.params as { referenceId: number; type: "CITA" | "REGALO" };
  // Access appointment data directly from route.params
  const { TokenAuthApi, user, SesionToken } = useAuth();
  const { setLoader } = useRender();
  const scrollViewRef = useRef(null);

  // State variables for both business and person ratings
  const [businessRating, setBusinessRating] = useState(0);
  const [personRating, setPersonRating] = useState(0);
  const [businessComment, setBusinessComment] = useState("");
  const [personComment, setPersonComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isBusiness, setIsBusiness] = useState(false);

  // Animated values
  const businessRatingScale = useSharedValue(1);
  const personRatingScale = useSharedValue(1);

  // Check if the current user is a business or client
  useEffect(() => {
    const checkUserType = async () => {
      try {
        const businessSession = await AsyncStorage.getItem("SesionBusiness");
        setIsBusiness(!!businessSession);
      } catch (error) {
        console.error("Error checking user type:", error);
      }
    };

    checkUserType();
  }, []);

  // Animated styles
  const businessRatingAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: businessRatingScale.value }],
    };
  });

  const personRatingAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: personRatingScale.value }],
    };
  });

  // Submit the rating
  const submitRating = async () => {
    // Validation for both ratings
    if (businessRating === 0) {
      ToastCall("error", "Por favor, selecciona una calificación para el negocio", "ES");
      return;
    }
    if (personRating === 0) {
      ToastCall("error", "Por favor, selecciona una calificación para el cliente", "ES");
      return;
    }

    try {
      setLoading(true);
      setLoader(true);

      const host = process.env.APP_BASE_API;
      const url =
        appointmentData.type === "CITA"
          ? "/api/appchancea/valorations/dual-rating-reservation"
          : "/api/appchancea/valorations/dual-rating-gif";
      const header = await GetHeader(TokenAuthApi, "application/json");

      // Prepare the payload with both ratings
      const payload = {
        referenceId: Number(appointmentData.referenceId),
        tokenSessionId: SesionToken,
        customersourceId: user?.id || 0,
        businessRating: businessRating,
        businessComment: businessComment,
        personRating: personRating,
        personComment: personComment,
      };
      console.log(payload);

      const response = await HttpService("post", host, url, payload, header);

      console.log(response);

      setSuccess(true);
      ToastCall("success", "¡Calificaciones enviadas con éxito!", "ES");

      // Wait 2 seconds before navigating back
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    } catch (err: any) {
      console.error("Error submitting rating:", err);
      ToastCall("error", "Error al enviar las calificaciones. Inténtalo de nuevo.", "ES");
    } finally {
      setLoading(false);
      setLoader(false);
    }
  };

  // Render star rating component
  const renderStarRating = (rating: number, setRating: (rating: number) => void, scaleValue: any, disabled = false) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => {
              if (!disabled) {
                setRating(star);
                scaleValue.value = withSpring(1.1, {}, () => {
                  scaleValue.value = withSpring(1);
                });
              }
            }}
            disabled={disabled || loading}
            style={styles.starButton}
            activeOpacity={0.7}
          >
            <FontAwesome
              name={star <= rating ? "star" : "star-o"}
              size={36}
              color={star <= rating ? "#FFD700" : "#CCCCCC"}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, "0");
      const month = date.toLocaleString("es", { month: "short" });
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    } catch (error) {
      return dateString || "";
    }
  };

  // Get rating description based on rating value
  const getBusinessRatingDescription = () => {
    return BUSINESS_RATING_DESCRIPTIONS[businessRating];
  };

  const getPersonRatingDescription = () => {
    return PERSON_RATING_DESCRIPTIONS[personRating];
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ height:height }}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with gradient */}
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerGradient}
          >
            {/* <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} disabled={loading}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity> */}
            <Text style={[styles.headerTitle, font.Bold]}>
              Calificar {appointmentData.type === "CITA" ? "Cita" : "Regalo"}
            </Text>
          </LinearGradient>

          {/* Business Rating Section */}
          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            style={[styles.ratingSection, businessRatingAnimatedStyle]}
          >
            <View style={styles.ratingHeader}>
              <View style={styles.ratingIconContainer}>
                <FontAwesome5 name="store" size={20} color={Colors.white} />
              </View>
              <Text style={[styles.ratingHeaderTitle, font.Bold]}>Calificar Negocio</Text>
            </View>

            <Text style={[styles.ratingTitle, font.Regular]}>¿Cómo calificarías al negocio?</Text>

            {renderStarRating(businessRating, setBusinessRating, businessRatingScale)}

            <Text style={[styles.ratingDescription, font.SemiBold]}>{getBusinessRatingDescription()}</Text>

            <View style={styles.commentContainer}>
              <Text style={[styles.commentLabel, font.Regular]}>Comentario sobre el negocio:</Text>
              <TextInput
                style={[styles.commentInput, font.Regular]}
                placeholder="Describe tu experiencia con este negocio..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={businessComment}
                onChangeText={setBusinessComment}
                editable={!loading}
                maxLength={500}
              />
              <Text style={[styles.commentCounter, font.Regular]}>{businessComment.length}/500</Text>
            </View>
          </Animated.View>

          {/* Person Rating Section */}
          <Animated.View
            entering={FadeInDown.delay(300).springify()}
            style={[styles.ratingSection, personRatingAnimatedStyle, styles.personRatingSection]}
          >
            <View style={[styles.ratingHeader, styles.personRatingHeader]}>
              <View style={[styles.ratingIconContainer, styles.personIconContainer]}>
                <FontAwesome5 name="user" size={20} color={Colors.white} />
              </View>
              <Text style={[styles.ratingHeaderTitle, font.Bold]}>Calificar acompañante</Text>
            </View>

            <Text style={[styles.ratingTitle, font.Regular]}>¿Cómo calificarías al acompañante?</Text>

            {renderStarRating(personRating, setPersonRating, personRatingScale)}

            <Text style={[styles.ratingDescription, font.SemiBold]}>{getPersonRatingDescription()}</Text>

            <View style={styles.commentContainer}>
              <Text style={[styles.commentLabel, font.Regular]}>Comentario sobre el acompañante:</Text>
              <TextInput
                style={[styles.commentInput, font.Regular]}
                placeholder="Describe tu experiencia con este acompañante..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={personComment}
                onChangeText={setPersonComment}
                editable={!loading}
                maxLength={500}
              />
              <Text style={[styles.commentCounter, font.Regular]}>{personComment.length}/500</Text>
            </View>
          </Animated.View>

          {/* Submit Button */}
          <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (businessRating === 0 || personRating === 0 || loading) && styles.submitButtonDisabled,
              ]}
              onPress={submitRating}
              disabled={businessRating === 0 || personRating === 0 || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <FontAwesome5 name="paper-plane" size={16} color="#FFFFFF" />
                  <Text style={[styles.submitButtonText, font.Bold]}>Enviar Calificaciones</Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Success Message */}
          {success && (
            <Animated.View entering={FadeIn.duration(300)} style={styles.successContainer}>
              <LinearGradient
                colors={["rgba(255,255,255,0.8)", "rgba(255,255,255,0.95)"]}
                style={styles.successGradient}
              >
                <View style={styles.successContent}>
                  <Animated.View entering={SlideInRight.springify()} style={styles.successIcon}>
                    <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.successIconGradient}>
                      <FontAwesome5 name="check" size={30} color="#FFFFFF" />
                    </LinearGradient>
                  </Animated.View>
                  <Text style={[styles.successText, font.Bold]}>¡Gracias por tus calificaciones!</Text>
                  <Text style={[styles.successSubtext, font.Regular]}>
                    Tus opiniones nos ayudan a mejorar la experiencia para todos.
                  </Text>
                </View>
              </LinearGradient>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  contentContainer: {
    paddingBottom: 40,
  },
  headerGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    color: "#FFFFFF",
    marginLeft: 8,
  },
  appointmentCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    margin: 16,
    marginTop: -20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: 18,
    color: Colors.secondary,
    marginBottom: 4,
  },
  appointmentDate: {
    fontSize: 14,
    color: "#666",
  },
  appointmentImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 12,
  },
  appointmentDetails: {
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.secondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: "#666",
  },
  ratingSection: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    margin: 16,
    marginTop: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  ratingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 10,
  },
  ratingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  ratingHeaderTitle: {
    color: Colors.white,
    fontSize: 16,
  },
  personRatingSection: {
    borderTopWidth: 3,
    borderTopColor: Colors.secondary,
  },
  personRatingHeader: {
    backgroundColor: Colors.secondary,
  },
  personIconContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  ratingTitle: {
    fontSize: 18,
    color: Colors.secondary,
    marginBottom: 20,
    textAlign: "center",
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  starButton: {
    padding: 6,
  },
  ratingDescription: {
    fontSize: 16,
    color: Colors.primary,
    marginTop: 8,
    marginBottom: 16,
    textAlign: "center",
  },
  commentContainer: {
    marginBottom: 16,
  },
  commentLabel: {
    fontSize: 14,
    color: Colors.secondary,
    marginBottom: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    minHeight: 100,
    color: "#333",
    backgroundColor: "#FAFAFA",
  },
  commentCounter: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 8,
  },
  examplesContainer: {
    marginTop: 8,
  },
  examplesTitle: {
    fontSize: 14,
    color: Colors.secondary,
    marginBottom: 12,
  },
  examplesScroll: {
    marginLeft: -5,
  },
  exampleItem: {
    backgroundColor: "#f5f7fa",
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    width: width * 0.7,
    maxWidth: 300,
  },
  personExampleItem: {
    borderLeftColor: Colors.secondary,
  },
  exampleText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  buttonContainer: {
    margin: 16,
    marginTop: 24,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    marginLeft: 10,
  },
  successContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  successGradient: {
    width: "90%",
    borderRadius: 20,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  successContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
  },
  successIcon: {
    marginBottom: 20,
  },
  successIconGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  successText: {
    fontSize: 20,
    color: Colors.secondary,
    marginBottom: 10,
    textAlign: "center",
  },
  successSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default AppointmentRatingScreen;
