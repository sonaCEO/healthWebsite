import { extendTheme } from "@chakra-ui/react";

export const theme = extendTheme({
  colors: {
    brand: {
      50: "#D4F8CB",
      100: "#97D684",
      500: "#79AC69",
      600: "#5C844F",
      700: "#415E37",
    },
    green: {
      50: "#F0FFF4",
      100: "#C6F6D5",
      200: "#9AE6B4",
      300: "#68D391",
      400: "#48BB78",
      500: "#38A169",
      600: "#2F855A",
      700: "#276749",
      800: "#22543D",
      900: "#1C4532",
    },
  },
  fonts: {
    heading: "'Inter', sans-serif",
    body: "'Inter', sans-serif",
  },
  styles: {
    global: {
      body: {
        background: "linear-gradient(to right, #A1C596, #469874)",
        minHeight: "100vh",
        width: "100vw",
      },
    },
  },
});
