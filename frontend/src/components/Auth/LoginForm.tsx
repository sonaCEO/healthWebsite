import { useState } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Button,
  Stack,
  Text,
  Link,
  useToast,
  Box,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Неверный формат email'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess: () => void;
}

const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const { login } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast({
        title: 'Успешный вход',
        description: 'Добро пожаловать!',
        status: 'success',
        duration: 3000,
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Ошибка входа',
        description: error.response?.data?.detail || 'Неверный email или пароль',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <FormControl isInvalid={!!errors.email}>
          <FormLabel>Почта</FormLabel>
          <Input
            type="email"
            {...register('email')}
            placeholder="example@mail.com"
          />
          {errors.email && (
            <Text color="red.500" fontSize="sm">{errors.email.message}</Text>
          )}
        </FormControl>

        <FormControl isInvalid={!!errors.password}>
          <FormLabel>Пароль</FormLabel>
          <Input
            type="password"
            {...register('password')}
            placeholder="••••••"
          />
          {errors.password && (
            <Text color="red.500" fontSize="sm">{errors.password.message}</Text>
          )}
        </FormControl>

        <Box textAlign="right">
          <Link color="brand.600" fontSize="sm">
            Забыли пароль?
          </Link>
        </Box>

        <Button
          type="submit"
          // colorScheme="brand"
          isLoading={isLoading}
          loadingText="Вход..."
        >
          Войти
        </Button>
      </Stack>
    </form>
  );
};

export default LoginForm;