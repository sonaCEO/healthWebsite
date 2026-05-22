import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  Card,
  CardBody,
  Text,
  Button,
  Flex,
  Badge,
  Divider,
  Input,
  FormControl,
  FormLabel,
  Textarea,
  useToast,
  Skeleton,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { ordersAPI } from '../utils/api';
import { type Order } from '../types';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    delivery_address: '',
    phone: '',
    notes: '',
  });
  const toast = useToast();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await ordersAPI.getMyOrders();
      setOrders(response.data);
    } catch (error) {
      toast({
        title: 'Ошибка загрузки заказов',
        status: 'error',
        duration: 3000,
      });
      console.log(error, 'error')
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Здесь будет логика оформления заказа
      // const response = await ordersAPI.create({
      //   items: cartItems,
      //   ...formData,
      //   delivery_date: new Date().toISOString(),
      // });
      
      toast({
        title: 'Заказ оформлен',
        description: 'Мы свяжемся с вами для подтверждения',
        status: 'success',
        duration: 5000,
      });
      
      setFormData({ delivery_address: '', phone: '', notes: '' });
      fetchOrders(); // Обновляем список заказов
    } catch (error) {
      toast({
        title: 'Ошибка оформления заказа',
        status: 'error',
        duration: 5000,
      });
      console.log(error, 'error')
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    try {
      await ordersAPI.cancel(orderId);
      toast({
        title: 'Заказ отменен',
        status: 'success',
        duration: 3000,
      });
      fetchOrders();
    } catch (error) {
      toast({
        title: 'Ошибка отмены заказа',
        status: 'error',
        duration: 3000,
      });
      console.log(error, 'error')
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'confirmed': return 'blue';
      case 'preparing': return 'purple';
      case 'delivering': return 'orange';
      case 'delivered': return 'green';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Container maxW="1200px" py={8}>
      <Heading as="h1" size="xl" mb={8}>
        Мои заказы
      </Heading>

      {!user ? (
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          Для просмотра заказов необходимо авторизоваться
        </Alert>
      ) : (
        <Flex direction={{ base: 'column', lg: 'row' }} gap={8}>
          {/* Список заказов */}
          <Box flex="1">
            <Heading size="md" mb={4}>История заказов</Heading>
            
            {isLoading ? (
              <VStack spacing={4}>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} height="150px" width="100%" borderRadius="md" />
                ))}
              </VStack>
            ) : orders.length === 0 ? (
              <Card>
                <CardBody textAlign="center" py={10}>
                  <Text color="gray.500">У вас пока нет заказов</Text>
                </CardBody>
              </Card>
            ) : (
              <VStack spacing={4} align="stretch">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardBody>
                      <Flex justify="space-between" align="start" mb={4}>
                        <Box>
                          <Text fontWeight="bold">Заказ #{order.id}</Text>
                          <Text color="gray.600" fontSize="sm">
                            {new Date(order.created_at).toLocaleDateString('ru-RU')}
                          </Text>
                        </Box>
                        <Badge colorScheme={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </Flex>
                      
                      <Divider mb={4} />
                      
                      <Box mb={4}>
                        <Text fontWeight="semibold" mb={2}>Товары:</Text>
                        {order.items.map((item, index) => (
                          <Text key={index} fontSize="sm">
                            {item.quantity} × {item.title || `Товар ${item.menu_id}`} — {item.price * item.quantity} ₽
                          </Text>
                        ))}
                      </Box>
                      
                      <Flex justify="space-between" align="center">
                        <Text fontWeight="bold">Итого: {order.total_amount} ₽</Text>
                        
                        {order.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            colorScheme="red"
                            onClick={() => handleCancelOrder(order.id)}
                          >
                            Отменить
                          </Button>
                        )}
                      </Flex>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            )}
          </Box>

          {/* Форма оформления заказа */}
          <Box flex="1">
            <Card>
              <CardBody>
                <Heading size="md" mb={6}>Оформление заказа</Heading>
                
                <form onSubmit={handleSubmit}>
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Адрес доставки</FormLabel>
                      <Input
                        placeholder="Введите полный адрес"
                        value={formData.delivery_address}
                        onChange={(e) => setFormData({...formData, delivery_address: e.target.value})}
                      />
                    </FormControl>
                    
                    <FormControl isRequired>
                      <FormLabel>Телефон</FormLabel>
                      <Input
                        placeholder="+7 999 999-99-99"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Примечания к заказу</FormLabel>
                      <Textarea
                        placeholder="Особые пожелания, время доставки и т.д."
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      />
                    </FormControl>
                    
                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      Оформление заказа возможно от 4-х блюд и больше
                    </Alert>
                    
                    <Box w="100%">
                      <Divider mb={4} />
                      <Flex justify="space-between" mb={4}>
                        <Text>Всего товаров:</Text>
                        <Text fontWeight="bold">0</Text>
                      </Flex>
                      <Flex justify="space-between" mb={6}>
                        <Text>Общая сумма:</Text>
                        <Text fontWeight="bold" fontSize="xl">0 ₽</Text>
                      </Flex>
                    </Box>
                    
                    <Button
                      type="submit"
                      colorScheme="brand"
                      size="lg"
                      w="100%"
                      isLoading={isSubmitting}
                      loadingText="Оформление..."
                      disabled={true} // Временно отключено, пока нет корзины
                    >
                      Оформить заказ
                    </Button>
                  </VStack>
                </form>
              </CardBody>
            </Card>
          </Box>
        </Flex>
      )}
    </Container>
  );
};

export default Orders;