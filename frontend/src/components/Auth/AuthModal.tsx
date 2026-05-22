import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
} from '@chakra-ui/react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { useAuth } from '../../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const { user } = useAuth();

  // Если пользователь уже авторизован, закрываем модалку
  if (user) {
    onClose();
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader textAlign="center">Авторизация</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Box textAlign="center" mb={4} color="gray.600">
            Авторизуйтесь, чтобы получить доступ к продуктам
          </Box>
          
          <Tabs isFitted variant="enclosed">
            <TabList mb={4}>
              <Tab>Войти</Tab>
              <Tab>Регистрация</Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel>
                <LoginForm onSuccess={onClose} />
              </TabPanel>
              <TabPanel>
                <RegisterForm onSuccess={onClose} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AuthModal;