import { useState } from "react";
import {
  Card,
  CardBody,
  CardFooter,
  Heading,
  Text,
  Image,
  Badge,
  Stack,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Box,
  Divider,
  List,
  ListItem,
  ListIcon,
  Flex,
  Grid,
} from "@chakra-ui/react";
import { type Recipe } from "../../types";
import { Helmet } from "react-helmet-async";
import LazyImage from "../LazyImage";
// добавить иконки svg потом
// import { CheckIcon, TimeIcon } from '@chakra-ui/icons';

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard = ({ recipe }: RecipeCardProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isOrdering, setIsOrdering] = useState(false);

  const handleOrder = async () => {
    setIsOrdering(true);
    try {
      // Здесь будет логика добавления в корзину
      // await ordersAPI.addToCart(recipe.id);
    } catch (error) {
      console.error("Order error:", error);
    } finally {
      setIsOrdering(false);
    }
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.description,
    recipeIngredient: recipe.ingredients.map(
      (i) => `${i.amount} ${i.unit} ${i.name}`,
    ),
    recipeCategory: recipe.category,
    prepTime: `PT${recipe.cooking_time}M`,
    nutrition: {
      "@type": "NutritionInformation",
      calories: `${recipe.calories} calories`,
      proteinContent: `${recipe.protein}g`,
      fatContent: `${recipe.fat}g`,
      carbohydrateContent: `${recipe.carbs}g`,
    },
    ...(recipe.image_url && { image: recipe.image_url }),
  };

  return (
    <>
      {isOpen && (
        <Helmet>
          <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        </Helmet>
      )}
      <Card
        direction="column"
        overflow="hidden"
        variant="outline"
        height="100%"
        _hover={{ transform: "translateY(-4px)", transition: "transform 0.2s" }}
      >
        {recipe.image_url && (
          <LazyImage
            src={recipe.image_url}
            alt={`Рецепт: ${recipe.title}`}
            height="200px"
          />
        )}

        <CardBody>
          <Stack spacing={3}>
            <Flex justify="space-between" align="start">
              <Heading size="md" as="h2">{recipe.title}</Heading>
              <Badge
                colorScheme={
                  recipe.difficulty === "easy"
                    ? "green"
                    : recipe.difficulty === "medium"
                      ? "yellow"
                      : "red"
                }
              >
                {recipe.difficulty}
              </Badge>
            </Flex>

            <Text color="gray.600" noOfLines={2}>
              {recipe.description}
            </Text>

            <Flex wrap="wrap" gap={2}>
              {recipe.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="subtle" colorScheme="brand">
                  {tag}
                </Badge>
              ))}
            </Flex>

            <Flex justify="space-between" color="gray.500" fontSize="sm">
              <Flex align="center" gap={1}>
                {/* <TimeIcon />  будущая иконка */}
                <Text>{recipe.cooking_time} мин</Text>
              </Flex>
              <Text>{recipe.calories} ккал</Text>
            </Flex>
          </Stack>
        </CardBody>

        <CardFooter>
          <Button
            variant="solid"
            colorScheme="brand"
            onClick={onOpen}
            width="full"
          >
            Подробнее
          </Button>
        </CardFooter>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Heading size="lg" as="h1">{recipe.title}</Heading>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Stack spacing={6}>
              {recipe.image_url && (
                <Image
                  src={recipe.image_url}
                  alt={`Фото блюда: ${recipe.title}`}
                  borderRadius="lg"
                  maxH="300px"
                  objectFit="cover"
                  mx="auto"
                  loading="lazy"
                />
              )}

              <Box>
                <Heading size="md" mb={3}>
                  Описание
                </Heading>
                <Text>{recipe.description}</Text>
              </Box>

              <Divider />

              <Box>
                <Heading size="md" mb={3}>
                  Пищевая ценность (на порцию)
                </Heading>
                <Grid templateColumns="repeat(4, 1fr)" gap={4}>
                  <Box textAlign="center">
                    <Text fontWeight="bold" color="brand.600">
                      {recipe.calories}
                    </Text>
                    <Text fontSize="sm">Ккал</Text>
                  </Box>
                  <Box textAlign="center">
                    <Text fontWeight="bold" color="green.600">
                      {recipe.protein}g
                    </Text>
                    <Text fontSize="sm">Белки</Text>
                  </Box>
                  <Box textAlign="center">
                    <Text fontWeight="bold" color="orange.600">
                      {recipe.carbs}g
                    </Text>
                    <Text fontSize="sm">Углеводы</Text>
                  </Box>
                  <Box textAlign="center">
                    <Text fontWeight="bold" color="red.600">
                      {recipe.fat}g
                    </Text>
                    <Text fontSize="sm">Жиры</Text>
                  </Box>
                </Grid>
              </Box>

              <Box>
                <Heading size="md" mb={3}>
                  Ингредиенты
                </Heading>
                <List spacing={2}>
                  {recipe.ingredients.map((ingredient, index) => (
                    <ListItem key={index}>
                      {/* <ListIcon as={ИКОНКА ДОЛЖНА БЫТЬ} color="green.500" /> */}
                      <ListIcon color="green.500" />
                      {ingredient.amount} {ingredient.unit} {ingredient.name}
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Box>
                <Heading size="md" mb={3}>
                  Инструкции приготовления
                </Heading>
                <List spacing={3}>
                  {recipe.instructions.map((instruction, index) => (
                    <ListItem key={index}>
                      <Text>
                        <Text as="span" fontWeight="bold" mr={2}>
                          Шаг {index + 1}:
                        </Text>
                        {instruction}
                      </Text>
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Flex wrap="wrap" gap={2}>
                {recipe.tags.map((tag) => (
                  <Badge key={tag} variant="subtle" colorScheme="green">
                    {tag}
                  </Badge>
                ))}
              </Flex>

              <Button
                colorScheme="green"
                size="lg"
                onClick={handleOrder}
                isLoading={isOrdering}
                loadingText="Добавление..."
              >
                Заказать это блюдо
              </Button>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default RecipeCard;
