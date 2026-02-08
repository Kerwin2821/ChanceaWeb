import { createTheme } from "@rn-vui/themed";

export const theme = createTheme({
  lightColors: {
    primary: "#553986",

    secondary: "#AA8ED6",
  },
  darkColors: {
    primary: "#AA8ED6",

    secondary: "#553986",
  },
});

export const mapStyle = [
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [
      {
        color: '#DAC8F5'
      }
    ]
  }
];