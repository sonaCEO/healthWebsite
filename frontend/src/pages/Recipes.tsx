import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  ButtonGroup,
  Grid,
  //   GridItem,
  // Card,
  // CardBody,
  Text,
  //   Image,
  //   Badge,
  //   Stack,
  Flex,
  //   Tag,
  //   TagLabel,
  Select,
  Skeleton,
  useToast,
} from "@chakra-ui/react";
// ИКОНКААА
// import { SearchIcon } from '@chakra-ui/icons';
import { useSearchParams } from "react-router-dom";
import { recipesAPI } from "../utils/api";
import { type Recipe } from "../types";
import RecipeCard from "../components/Recipe/RecipeCard";
import AISearch from "../components/AI/AISearch";
import SEO from "../components/SEO";

interface PaginatedRecipes {
  items: Recipe[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

const Recipes = () => {
  const [recipes, setRecipes] = useState<PaginatedRecipes | null>(null);
  // const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all",
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState(
    searchParams.get("difficulty") || "all",
  );
  const [maxCalories, setMaxCalories] = useState(
    searchParams.get("max_calories") || "",
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort_by") || "id"); // ← ДОБАВЛЕНО
  const [sortOrder, setSortOrder] = useState(
    searchParams.get("sort_order") || "asc",
  );
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  // const [aiQuery, setAiQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  // const [isAiLoading, setIsAiLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchRecipes();
  }, [page, sortBy, sortOrder]);

  const fetchRecipes = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page,
        page_size: 6,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      if (searchQuery) params.search = searchQuery;
      if (selectedCategory !== "all") params.category = selectedCategory;
      if (selectedDifficulty !== "all") params.difficulty = selectedDifficulty;
      if (maxCalories) params.max_calories = Number(maxCalories);

      const response = await recipesAPI.getAll(params);
      setRecipes(response.data);

      const newParams: any = {
        page: String(page),
        sort_by: sortBy,
        sort_order: sortOrder,
      };
      if (searchQuery) newParams.search = searchQuery;
      if (selectedCategory !== "all") newParams.category = selectedCategory;
      if (selectedDifficulty !== "all")
        newParams.difficulty = selectedDifficulty;
      if (maxCalories) newParams.max_calories = maxCalories;
      setSearchParams(newParams);
    } catch (error) {
      toast({
        title: "Ошибка загрузки рецептов",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = () => {
    setPage(1);
    fetchRecipes();
  };

  const categories = [
    "all",
    "breakfast",
    "main",
    "dessert",
    "snack",
    "salad",
    "soup",
  ];
  const difficulties = ["all", "very_easy", "easy", "medium", "hard"];

  // const filterRecipes = () => {
  //   let filtered = [...recipes];

  //   if (searchQuery) {
  //     const query = searchQuery.toLowerCase();
  //     filtered = filtered.filter(
  //       (recipe) =>
  //         recipe.title.toLowerCase().includes(query) ||
  //         recipe.description.toLowerCase().includes(query) ||
  //         recipe.tags.some((tag) => tag.toLowerCase().includes(query)),
  //     );
  //   }

  //   if (selectedCategory !== "all") {
  //     filtered = filtered.filter(
  //       (recipe) => recipe.category === selectedCategory,
  //     );
  //   }

  //   setFilteredRecipes(filtered);
  // };

  // const handleAiSearch = async () => {
  //   if (!aiQuery.trim()) return;

  //   setIsAiLoading(true);
  //   try {
  //     // Здесь будет интеграция с AI API
  //     // Пока используем обычный поиск
  //     const response = await recipesAPI.search(aiQuery);
  //     setFilteredRecipes(response.data);

  //     toast({
  //       title: "AI поиск выполнен",
  //       description: `Найдено ${response.data.length} рецептов`,
  //       status: "success",
  //       duration: 3000,
  //     });
  //   } catch (error) {
  //     toast({
  //       title: "Ошибка AI поиска",
  //       status: "error",
  //       duration: 3000,
  //     });
  //     console.log(error, "error");
  //   } finally {
  //     setIsAiLoading(false);
  //   }
  // };

  return (
    <Container maxW="1200px" py={8}>
      <SEO
        title="Рецепты здорового питания"
        description="Сотни рецептов для здорового питания с подсчётом калорий, белков, жиров и углеводов."
        canonical="http://localhost:5173/recipes"
      />
      <Heading as="h1" size="xl" mb={8} textAlign="center">
        Рецепты для здорового питания
      </Heading>
      <AISearch />
      {/* Фильтры */}
      <Flex mb={6} gap={4} wrap="wrap">
        {/* gоиск без изменений */}
        <InputGroup flex="1" minW="250px">
          <Input
            placeholder="Поиск рецептов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFilterChange()} // ← ДОБАВЛЕНО: поиск по Enter
          />
          <InputRightElement>
            <Button size="sm" onClick={handleFilterChange} variant="ghost">
              🔍
            </Button>{" "}
          </InputRightElement>
        </InputGroup>

        <Select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setPage(1);
          }} // ← ИЗМЕНЕНО: сброс страницы
          w="180px"
        >
          <option value="all">Все категории</option>
          {categories
            .filter((c) => c !== "all")
            .map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
        </Select>

        <Select
          value={selectedDifficulty}
          onChange={(e) => {
            setSelectedDifficulty(e.target.value);
            setPage(1);
          }}
          w="180px"
        >
          <option value="all">Любая сложность</option>
          {difficulties
            .filter((d) => d !== "all")
            .map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficulty}
              </option>
            ))}
        </Select>

        <Input
          placeholder="Макс. калории"
          type="number"
          value={maxCalories}
          onChange={(e) => setMaxCalories(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleFilterChange()}
          w="150px"
        />

        <Select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(1);
          }}
          w="180px"
        >
          <option value="id">По умолчанию</option>
          <option value="calories">По калориям</option>
          <option value="cooking_time">По времени</option>
          <option value="protein">По белкам</option>
        </Select>

        <Select
          value={sortOrder}
          onChange={(e) => {
            setSortOrder(e.target.value);
            setPage(1);
          }}
          w="130px"
        >
          <option value="asc">По возрастанию</option>
          <option value="desc">По убыванию</option>
        </Select>

        <Button onClick={handleFilterChange} colorScheme="green">
          Применить
        </Button>
      </Flex>

      {isLoading ? (
        <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} height="400px" borderRadius="lg" />
          ))}
        </Grid>
      ) : (
        <>
          <Text mb={4} color="gray.600">
            Найдено {recipes?.total || 0} рецептов
          </Text>

          <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
            {recipes?.items.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </Grid>

          {recipes?.items.length === 0 && (
            <Box textAlign="center" py={10}>
              <Text fontSize="lg" color="gray.500">
                Рецепты не найдены. Попробуйте изменить параметры поиска.
              </Text>
            </Box>
          )}

          {recipes && recipes.total_pages > 1 && (
            <Flex justify="center" mt={8} gap={2}>
              <Button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                isDisabled={page === 1}
                variant="outline"
              >
                ←
              </Button>

              <ButtonGroup variant="outline">
                {Array.from(
                  { length: recipes.total_pages },
                  (_, i) => i + 1,
                ).map((p) => (
                  <Button
                    key={p}
                    onClick={() => setPage(p)}
                    colorScheme={p === page ? "green" : "gray"}
                    variant={p === page ? "solid" : "outline"}
                  >
                    {p}
                  </Button>
                ))}
              </ButtonGroup>

              <Button
                onClick={() =>
                  setPage((p) => Math.min(recipes.total_pages, p + 1))
                }
                isDisabled={page === recipes.total_pages}
                variant="outline"
              >
                →
              </Button>
            </Flex>
          )}
        </>
      )}
    </Container>
  );
};

export default Recipes;
