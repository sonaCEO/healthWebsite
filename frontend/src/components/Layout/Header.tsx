import { Box, Flex, Button, useDisclosure } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import AuthModal from "../Auth/AuthModal";
import { useAuth } from "../../contexts/AuthContext";

const Header = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, logout } = useAuth();

  const isAdmin =
    user?.email?.endsWith("@pp.health") || user?.email === "admin@pp.health";
  return (
    <>
      <Box as="header" bg="body.background" shadow="sm" py={4}>
        <Flex
          maxW="1200px"
          mx="auto"
          px={4}
          align="center"
          justify="space-between"
        >
          <Box fontSize="xl" fontWeight="bold" color="blackAlpha.900">
            pp.health
          </Box>

          <Flex gap={6}>
            <Link to="/menu">
              <Button variant="ghost">Меню</Button>
            </Link>
            <Link to="/articles">
              <Button variant="ghost">Статьи</Button>
            </Link>
            <Link to="/recipes">
              <Button variant="ghost">Рецепты</Button>
            </Link>
            <Link to="/orders">
              <Button variant="ghost">Заказы</Button>
            </Link>
            {isAdmin && (
              <Link to="/admin">
                <Button variant="ghost" colorScheme="red">
                  Админ
                </Button>
              </Link>
            )}
          </Flex>

          <Flex gap={2}>
            {user ? (
              <Button onClick={logout} variant="ghost" size="md">
                Выйти
              </Button>
            ) : (
              <>
                <Button onClick={onOpen} variant="ghost" size="md">
                  Регистрация
                </Button>
                <Button onClick={onOpen} variant="ghost" size="md">
                  Вход
                </Button>
              </>
            )}
          </Flex>
        </Flex>
      </Box>

      <AuthModal isOpen={isOpen} onClose={onClose} />
    </>
  );
};

export default Header;
