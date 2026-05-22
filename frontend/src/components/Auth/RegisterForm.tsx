import { useState } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Button,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';

const registerSchema = z.object({
  email: z.string().email('Неверный формат email'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
  confirmPassword: z.string(),
  full_name: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess: () => void;
}

const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const { register: registerUser } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerUser(data.email, data.password, data.full_name);
      toast({
        title: 'Успешная регистрация',
        description: 'Теперь вы можете войти в систему',
        status: 'success',
        duration: 3000,
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Ошибка регистрации',
        description: error.response?.data?.detail || 'Пользователь с таким email уже существует',
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
        <FormControl isInvalid={!!errors.full_name}>
          <FormLabel>Имя</FormLabel>
          <Input
            {...register('full_name')}
            placeholder="Иван Иванов"
          />
          {errors.full_name && (
            <Text color="red.500" fontSize="sm">{errors.full_name.message}</Text>
          )}
        </FormControl>

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

        <FormControl isInvalid={!!errors.confirmPassword}>
          <FormLabel>Подтвердите пароль</FormLabel>
          <Input
            type="password"
            {...register('confirmPassword')}
            placeholder="••••••"
          />
          {errors.confirmPassword && (
            <Text color="red.500" fontSize="sm">{errors.confirmPassword.message}</Text>
          )}
        </FormControl>

        <Button
          type="submit"
          // colorScheme="brand"
          isLoading={isLoading}
          loadingText="Регистрация..."
        >
          Зарегистрироваться
        </Button>
      </Stack>
    </form>
  );
};

export default RegisterForm;