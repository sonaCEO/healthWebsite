import { Container, Heading } from "@chakra-ui/react";
import CalorieCalculator from "../components/Calculator/CalorieCalculator";
import SEO from "../components/SEO";

const Menu = () => {
  return (
    <Container maxW="1200px" py={8}>
      <SEO
        title="Планы меню"
        description="Готовые планы питания на 28 дней с разной калорийностью для похудения, поддержания и набора массы."
        canonical="http://localhost:5173/menu"
      />
      <Heading as="h1" size="xl" mb={8} textAlign="center">
        Персональное меню и калькулятор калорий
      </Heading>
      <CalorieCalculator />
    </Container>
  );
};

export default Menu;
