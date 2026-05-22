import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Grid,
  Card,
  CardBody,
  Text,
  Badge,
  Flex,
  Skeleton,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Modal,
  ModalContent,
  ModalOverlay,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  Button,
  ButtonGroup,
} from "@chakra-ui/react";
// import { SearchIcon } from '@chakra-ui/icons'
import { articlesAPI } from "../utils/api";
import { useSearchParams } from "react-router-dom";
import { type Article } from "../types";
import SEO from "../components/SEO";

interface PaginatedArticles {
  items: Article[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

const Articles = () => {
  const [articles, setArticles] = useState<PaginatedArticles | null>(null);
  // const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all",
  );
  const [sortBy, setSortBy] = useState(
    searchParams.get("sort_by") || "published_at",
  ); // ← ДОБАВЛЕНО
  const [sortOrder, setSortOrder] = useState(
    searchParams.get("sort_order") || "desc",
  ); // ← ДОБАВЛЕНО
  const [maxReadTime, setMaxReadTime] = useState(
    searchParams.get("max_read_time") || "",
  ); // ← ДОБАВЛЕНО
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    fetchArticles();
  }, [page, sortBy, sortOrder]);

  // useEffect(() => {
  //   filterArticles();
  // }, [searchQuery, selectedCategory, articles]);

  const fetchArticles = async () => {
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
      if (maxReadTime) params.max_read_time = Number(maxReadTime);

      const response = await articlesAPI.getAll(params);
      setArticles(response.data);
      // setFilteredArticles(response.data);

      const newParams: any = {
        page: String(page),
        sort_by: sortBy,
        sort_order: sortOrder,
      };
      if (searchQuery) newParams.search = searchQuery;
      if (selectedCategory !== "all") newParams.category = selectedCategory;
      if (maxReadTime) newParams.max_read_time = maxReadTime;
      setSearchParams(newParams);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = () => {
    setPage(1);
    fetchArticles();
  };

  // const filterArticles = () => {
  //   let filtered = [...articles];

  //   if (searchQuery) {
  //     const query = searchQuery.toLowerCase();
  //     filtered = filtered.filter(
  //       (article) =>
  //         article.title.toLowerCase().includes(query) ||
  //         article.content.toLowerCase().includes(query) ||
  //         article.tags.some((tag) => tag.toLowerCase().includes(query)),
  //     );
  //   }

  //   if (selectedCategory !== "all") {
  //     filtered = filtered.filter(
  //       (article) => article.category === selectedCategory,
  //     );
  //   }

  //   setFilteredArticles(filtered);
  // };

  const categories = ["all", "health", "nutrition", "fitness", "wellness"];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "health":
        return "green";
      case "nutrition":
        return "blue";
      case "fitness":
        return "orange";
      case "wellness":
        return "purple";
      default:
        return "gray";
    }
  };

  const handleCardClick = (article: Article) => {
    setSelectedArticle(article);
    onOpen();
  };

  return (
    <Container maxW="1200px" py={8}>
      <SEO
        title="Статьи о здоровье и питании"
        description="Полезные статьи о здоровом питании, фитнесе и велнесе от экспертов."
        canonical="http://localhost:5173/articles"
      />
      <Heading as="h1" size="xl" mb={8} textAlign="center">
        Полезные статьи о здоровье и питании
      </Heading>

      {/* Фильтры */}
      {/* <Flex mb={8} gap={4} wrap="wrap" justify="center">
        <InputGroup maxW="400px">
          <InputLeftElement> */}
      {/* <SearchIcon color="gray.400" /> */}
      {/* </InputLeftElement>
          <Input
            placeholder="Поиск статей"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>

        <Select
          placeholder="Все категории"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          w="200px"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === "all" ? "Все категории" : category}
            </option>
          ))}
        </Select>
      </Flex> */}

      <Flex mb={8} gap={4} wrap="wrap" justify="center">
        <InputGroup maxW="300px">
          <InputLeftElement />
          <Input
            placeholder="Поиск статей"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFilterChange()} // ← ДОБАВЛЕНО
          />
        </InputGroup>

        <Select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setPage(1);
          }} // ← ИЗМЕНЕНО
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

        <Input
          placeholder="Макс. мин чтения"
          type="number"
          value={maxReadTime}
          onChange={(e) => setMaxReadTime(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleFilterChange()}
          w="160px"
        />

        <Select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(1);
          }}
          w="180px"
        >
          <option value="published_at">По дате</option>
          <option value="read_time">По времени чтения</option>
          <option value="title">По названию</option>
        </Select>

        <Select
          value={sortOrder}
          onChange={(e) => {
            setSortOrder(e.target.value);
            setPage(1);
          }}
          w="160px"
        >
          <option value="desc">Сначала новые</option>
          <option value="asc">Сначала старые</option>
        </Select>

        <Button onClick={handleFilterChange} colorScheme="green">
          Применить
        </Button>
      </Flex>

      {isLoading ? (
        <Grid
          templateColumns={{
            base: "1fr",
            md: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          }}
          gap={6}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} height="300px" borderRadius="lg" />
          ))}
        </Grid>
      ) : (
        <>
          <Text mb={4} color="gray.600">
            Найдено {articles?.items.length} статей
          </Text>

          <Grid
            templateColumns={{
              base: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            }}
            gap={6}
          >
            {articles?.items.map((article) => (
              <Card
                key={article.id}
                cursor="pointer"
                onClick={() => handleCardClick(article)}
                _hover={{
                  transform: "translateY(-4px)",
                  transition: "transform 0.2s",
                }}
              >
                <CardBody>
                  <Stack spacing={4}>
                    <Flex justify="space-between" align="start">
                      <Badge colorScheme={getCategoryColor(article.category)}>
                        {article.category}
                      </Badge>
                      <Text fontSize="sm" color="gray.500">
                        {article.read_time} мин
                      </Text>
                    </Flex>

                    <Heading size="md">{article.title}</Heading>

                    <Text color="gray.600" noOfLines={3}>
                      {article.content.substring(0, 150)}...
                    </Text>

                    <Flex justify="space-between" align="center">
                      <Text fontSize="sm" color="gray.500">
                        {article.author}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {new Date(article.published_at).toLocaleDateString(
                          "ru-RU",
                        )}
                      </Text>
                    </Flex>

                    <Flex wrap="wrap" gap={2}>
                      {article.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="subtle"
                          colorScheme="brand"
                          fontSize="xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </Flex>
                  </Stack>
                </CardBody>
              </Card>
            ))}
          </Grid>

          {articles?.items.length === 0 && (
            <Box textAlign="center" py={10}>
              <Text fontSize="lg" color="gray.500">
                Статьи не найдены. Попробуйте изменить параметры поиска.
              </Text>
            </Box>
          )}

          {/* пагинация */}
          {articles && articles.total_pages > 1 && (
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
                  { length: articles.total_pages },
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
                  setPage((p) => Math.min(articles.total_pages, p + 1))
                }
                isDisabled={page === articles.total_pages}
                variant="outline"
              >
                →
              </Button>
            </Flex>
          )}
        </>
      )}

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          {selectedArticle && (
            <>
              <ModalHeader>{selectedArticle.title}</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                <Flex justify="space-between" mb={4}>
                  <Badge
                    colorScheme={getCategoryColor(selectedArticle.category)}
                  >
                    {selectedArticle.category}
                  </Badge>
                  <Text fontSize="sm" color="gray.500">
                    {selectedArticle.read_time} мин чтения
                  </Text>
                </Flex>

                <Flex justify="space-between" mb={4}>
                  <Text fontSize="sm" color="gray.500">
                    {selectedArticle.author}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {new Date(selectedArticle.published_at).toLocaleDateString(
                      "ru-RU",
                    )}
                  </Text>
                </Flex>

                {/* Полный текст статьи */}
                <Text whiteSpace="pre-line" mb={4}>
                  {selectedArticle.content}
                </Text>

                <Flex wrap="wrap" gap={2} mt={4}>
                  {selectedArticle.tags.map((tag) => (
                    <Badge key={tag} variant="subtle" fontSize="xs">
                      {tag}
                    </Badge>
                  ))}
                </Flex>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Articles;
