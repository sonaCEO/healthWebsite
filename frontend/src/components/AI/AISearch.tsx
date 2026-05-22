import { useState } from "react";
import {
  Box,
  Input,
  Button,
  Text,
  VStack,
  Spinner,
  Card,
  CardBody,
  Tag,
  TagLabel,
  Flex,
  useToast,
  Heading,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
// import { SearchIcon, StarIcon } from '@chakra-ui/icons'
import { aiAPI } from "../../utils/api";

const AISearch = () => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any>(null);
  const toast = useToast();

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const response = await aiAPI.searchRecipes(query);
      setResults(response.data);

      toast({
        title: response.data.ai_available
          ? "AI поиск выполнен"
          : "Обычный поиск",
        description: `Найдено ${response.data.total_found} рецептов`,
        status: "success",
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: "Ошибка поиска",
        description: error.response?.data?.detail || "Попробуйте позже",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        <Box>
          <Heading fontWeight="bold" mb={2}>
            Твой AI-помощник
          </Heading>
          <Text color="gray.600" mb={4}>
            Найдите рецепт, подходящий под ваши критерии
          </Text>
        </Box>

        <InputGroup size="lg" mb={2}>
          <Input
            placeholder="Например: вегетарианский ужин на 30 минут с низким содержанием углеводов"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            size="lg"
          />
          <InputRightElement width="4.5rem">
            <Button
              onClick={handleSearch}
              colorScheme="brand"
              size="lg"
              isLoading={isSearching}
              loadingText="AI ищет..."
              // leftIcon={<SearchIcon />}
            >
              Найти
            </Button>
          </InputRightElement>
        </InputGroup>

        {results && (
          <Box mt={6}>
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="md">
                {results.ai_available ? "🤖 AI нашёл:" : "🔍 Найдено:"}
              </Heading>
              <Tag colorScheme={results.ai_available ? "green" : "gray"}>
                <TagLabel>
                  {results.ai_available ? "AI Поиск" : "Обычный поиск"}
                </TagLabel>
              </Tag>
            </Flex>

            {results.ai_analysis && (
              <Card mb={4} bg="blue.50">
                <CardBody>
                  <Text fontWeight="bold" mb={2}>
                    AI анализ запроса:
                  </Text>
                  <Text>
                    🕒 Время: {results.ai_analysis.max_cooking_time || "любое"}{" "}
                    мин | 📊 Калории:{" "}
                    {results.ai_analysis.max_calories || "любые"} | 🥦 Диета:{" "}
                    {results.ai_analysis.dietary_restrictions?.join(", ") ||
                      "нет ограничений"}
                  </Text>
                </CardBody>
              </Card>
            )}

            {results.recipes.length === 0 ? (
              <Text textAlign="center" py={10} color="gray.500">
                Рецепты не найдены. Попробуйте изменить запрос.
              </Text>
            ) : (
              <VStack spacing={4} align="stretch">
                {results.recipes.map((recipe: any, index: number) => (
                  <Card key={recipe.id || index} _hover={{ shadow: "md" }}>
                    <CardBody>
                      <Flex justify="space-between" align="start">
                        <Box>
                          <Heading size="sm" mb={2}>
                            {recipe.title}
                          </Heading>
                          <Text color="gray.600" mb={2}>
                            {recipe.description}
                          </Text>

                          <Flex gap={2} mb={3}>
                            <Tag size="sm" colorScheme="blue">
                              {recipe.cooking_time} мин
                            </Tag>
                            <Tag size="sm" colorScheme="green">
                              {recipe.calories} ккал
                            </Tag>
                            <Tag size="sm" colorScheme="purple">
                              {recipe.difficulty}
                            </Tag>
                          </Flex>

                          {recipe.ai_comment && (
                            <Box bg="green.50" p={3} borderRadius="md" mb={3}>
                              <Text fontSize="sm" color="green.800">
                                <strong>🤖 AI:</strong> {recipe.ai_comment}
                              </Text>
                            </Box>
                          )}

                          {recipe.ai_score && (
                            <Flex align="center" gap={1}>
                              {/* <StarIcon color="yellow.500" /> */}
                              <Text fontSize="sm">
                                Совпадение с запросом: {recipe.ai_score}/10
                              </Text>
                            </Flex>
                          )}
                        </Box>

                        <Button
                          size="sm"
                          colorScheme="brand"
                          onClick={() =>
                            (window.location.href = `/recipes/${recipe.id}`)
                          }
                        >
                          Открыть
                        </Button>
                      </Flex>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            )}
          </Box>
        )}

        {isSearching && (
          <Box textAlign="center" py={10}>
            <Spinner size="lg" color="brand.500" />
            <Text mt={4} color="gray.600">
              AI анализирует ваш запрос и ищет подходящие рецепты...
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default AISearch;
