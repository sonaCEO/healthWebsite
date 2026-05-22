export interface User {
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_admin: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

export interface Recipe {
  id: number;
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  cooking_time: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: string;
  difficulty: string;
  image_url: string | null;
  tags: string[];
}

export interface Article {
  id: number;
  title: string;
  content: string;
  author: string;
  category: string;
  read_time: number;
  published_at: string;
  image_url: string | null;
  tags: string[];
}

export interface OrderItem {
  menu_id: number;
  quantity: number;
  price: number;
  title?: string;
}

export interface Order {
  id: number;
  user_id: number;
  items: OrderItem[];
  total_amount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';
  delivery_address: string;
  phone: string;
  delivery_date: string;
  created_at: string;
  notes?: string;
}

export interface CalculatorData {
  sex: 'male' | 'female';
  height_cm: number;
  weight_kg: number;
  age: number;
  activity: 'sedentary' | 'light' | 'moderate' | 'high';
  goal: 'loss' | 'maintain' | 'gain';
}

export interface CalculationResult {
  bmr: number;
  maintain: number;
  loss: number;
  gain: number;
  chosen_menu: any;
}