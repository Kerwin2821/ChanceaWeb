import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Platform, TouchableOpacity } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import { Image } from 'expo-image';
import Button from '../../components/ButtonComponent/Button';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../utils';
import { height, width } from '../../utils/Helpers';
import { NavigationScreenNavigationType } from '../../navigation/StackNavigator';
import { Entypo } from '@expo/vector-icons';

const IntroScreen = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const sliderRef = useRef<any>(null);

  const navigation = useNavigation<NavigationScreenNavigationType>();

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % slides.length;
      sliderRef.current?.goToSlide(nextIndex, true);
      setActiveIndex(nextIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeIndex]);

  const handleNext = () => {
    const nextIndex = (activeIndex + 1) % slides.length;
    sliderRef.current?.goToSlide(nextIndex, true);
    setActiveIndex(nextIndex);
  };

  const handlePrev = () => {
    const prevIndex = (activeIndex - 1 + slides.length) % slides.length;
    sliderRef.current?.goToSlide(prevIndex, true);
    setActiveIndex(prevIndex);
  };

  const RenderItem = ({ item }: { item: any }) => {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: item.backgroundColor,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 30
        }}
      >
        <View style={styles.titleWrapper}>
          <Text style={styles.introTitleStyle}>{item.title}</Text>
        </View>

        <View style={styles.imageContainer}>
          <View style={styles.imageAura} />
          <Image
            style={styles.introImageStyle}
            source={item.image}
            contentFit="contain"
            transition={{ duration: 400 }}
          />
        </View>

        <View style={styles.textWrapper}>
          <Text style={styles.introTextStyle}>{item.text}</Text>
          {item.extraText && (
            <Text style={styles.introExtraTextStyle}>{item.extraText}</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 w-full md:max-w-lg md:mx-auto justify-between pb-8">
        <View style={styles.sliderContainer}>
          <AppIntroSlider
            ref={sliderRef}
            data={slides}
            renderItem={RenderItem}
            onSlideChange={(index) => setActiveIndex(index)}
            dotStyle={styles.dotStyle}
            activeDotStyle={styles.activeDotStyle}
            style={{ backgroundColor: "white" }}
            showNextButton={false}
            showDoneButton={false}
          />

          {/* Navigation Arrows */}
          <TouchableOpacity
            style={[styles.arrowButton, styles.leftArrow]}
            onPress={handlePrev}
          >
            <Entypo name="chevron-left" size={32} color={Colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.arrowButton, styles.rightArrow]}
            onPress={handleNext}
          >
            <Entypo name="chevron-right" size={32} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <View className="w-full px-5">
          <Button
            text="Comenzar"
            onPress={() => {
              navigation.navigate('LocalizationP');
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default IntroScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 5,
    justifyContent: 'center',
    color: 'black'
  },
  titleStyle: {
    color: 'black',
    padding: 10,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold'
  },
  paragraphStyle: {
    padding: 20,
    textAlign: 'center',
    color: 'black',
    fontSize: 16
  },
  introImageStyle: {
    width: Platform.OS === 'web' ? 320 : width * 0.8,
    height: Platform.OS === 'web' ? 320 : width * 0.8,
    zIndex: 2,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },
  imageAura: {
    position: 'absolute',
    width: Platform.OS === 'web' ? 360 : width * 0.9,
    height: Platform.OS === 'web' ? 360 : width * 0.9,
    borderRadius: 200,
    backgroundColor: Colors.BackgroundLight,
    opacity: 0.7,
    zIndex: 1,
  },
  titleWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  textWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  introTextStyle: {
    fontSize: 18,
    color: Colors.grayDark,
    textAlign: 'center',
    fontFamily: 'Bold',
    lineHeight: 24,
  },
  introExtraTextStyle: {
    fontSize: 14,
    color: Colors.grayDark,
    textAlign: 'center',
    fontFamily: 'Regular',
    marginTop: 12,
    lineHeight: 20,
    opacity: 0.8,
  },
  introTitleStyle: {
    fontSize: 32,
    color: Colors.secondary,
    textAlign: 'center',
    fontFamily: 'Bold',
    letterSpacing: -0.5,
  },
  sliderContainer: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
  },
  arrowButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -25,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 22,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  leftArrow: {
    left: 15,
  },
  rightArrow: {
    right: 15,
  },
  dotStyle: {
    backgroundColor: '#E5E7EB',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDotStyle: {
    backgroundColor: Colors.primary,
    width: 24,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});

const slides = [
  {
    key: 's1',
    title: 'Bienvenidos a',
    text: 'Donde encontrarás con quién Chancear',
    extraText: 'Chancear es el arte del coqueteo criollo, una mezcla de picardía, humor y astucia verbal utilizada para conquistar o atraer a alguien que despierta interés romántico.',
    image: require('./../../../assets/intro/WelcomeImg1.svg'),
    backgroundColor: '#FFFFFF'
  },
  {
    key: 's2',
    title: 'Conoce gente nueva',
    text: 'Haz nuevos amigos',
    extraText: 'Chancero es aquel individuo que ha elevado el coqueteo a un estilo de vida o una habilidad técnica destacada.',
    image: require('./../../../assets/intro/WelcomeImg2.svg'),
    backgroundColor: '#FFFFFF'
  },
  {
    key: 's3',
    title: 'Diviértete',
    text: 'Ahora con chancea podrás tener acceso a los mejores eventos para que no te quedes solo chancea es la nueva red social venezolana para conectar personas de forma real y segura',
    image: require('./../../../assets/intro/WelcomeImg3.svg'),
    backgroundColor: '#FFFFFF'
  },
  {
    key: 's4',
    title: 'Busca chanceos',
    text: 'estamos rompiendo el paradigma de que es posible tener seguridad usando una red social para conocer personas',
    image: require('./../../../assets/intro/WelcomeImg4.svg'),
    backgroundColor: '#FFFFFF'
  }
];
