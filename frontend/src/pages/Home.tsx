import {
  Box,
  Container,
  Heading,
  Text,
  Grid,
  Card,
  CardBody,
  Button,
  Image,
  Flex,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import SEO from "../components/SEO";

const Home = () => {
  // тест на иннтеграцию фронта с беком
  useEffect(() => {
    fetch("http://localhost:8080/health")
      .then((res) => res.json())
      .then((data) => console.log("Backend status:", data))
      .catch((err) => console.error("Backend connection error:", err));
  }, []);

  return (
    <Box>
      <SEO
        title="pp.health — Здоровое питание"
        description="Рецепты, статьи и планы меню для здорового питания. Найдите свой идеальный рацион."
        canonical="http://localhost:5173/"
      />
      <Box bg="linear-gradient(to right, #A1C596, #469874)" py={12}>
        <Container maxW="1200px">
          <Flex
            direction={{ base: "column", md: "row" }}
            align="center"
            gap={10}
          >
            <Box flex={1}>
              <Image
                src="/src/assets/image.png"
                alt="Брокколи"
                borderRadius="lg"
                width="100%"
                maxW="400px"
                mx="auto"
                // shadow="xl"
              />
            </Box>
            <Box flex={1} color="white">
              <Heading as="h1" size="2xl" mb={4}>
                Умное меню: рецепты, заказы и забота о вас
              </Heading>
              <Text fontSize="lg" mb={8} opacity={0.9}>
                Точный подбор рецептов, сбалансированные меню и удобные заказы —
                всё для гармонии вкуса, здоровья и удобства.
              </Text>
              <Button
                as={Link}
                to="/menu"
                colorScheme="whiteAlpha"
                size="lg"
                _hover={{ bg: "white", color: "#469874" }}
              >
                Рассчитать моё меню
              </Button>
            </Box>
          </Flex>
        </Container>
      </Box>
      <Container maxW="1200px" py={0}>
        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={8}>
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>
                100+ Рецептов
              </Heading>
              <Text>Тщательно подобранная коллекция вкусных рецептов</Text>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Heading size="md" mb={4}>
                AI-помощник
              </Heading>
              <Text>
                Точные рекомендации вкусных и безопасных блюд — ИИ заботится о
                вашем рационе
              </Text>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Heading size="md" mb={4}>
                Меню для похудения
              </Heading>
              <Text>
                Персональный план питания, основанный на ваших данных и целях
              </Text>
            </CardBody>
          </Card>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;
