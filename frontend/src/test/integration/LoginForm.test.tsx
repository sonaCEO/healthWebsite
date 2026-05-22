import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import LoginForm from "../../components/Auth/LoginForm";

// Мокируем useAuth
vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({
    login: vi.fn().mockResolvedValue(undefined),
    user: null,
    token: null,
    logout: vi.fn(),
    register: vi.fn(),
    isLoading: false,
  }),
}));

const renderLoginForm = (onSuccess = vi.fn()) => {
  return render(
    <ChakraProvider>
      <LoginForm onSuccess={onSuccess} />
    </ChakraProvider>,
  );
};

describe("LoginForm", () => {
  it("рендерится корректно", () => {
    renderLoginForm();
    expect(screen.getByPlaceholderText("example@mail.com")).toBeTruthy();
    expect(screen.getByPlaceholderText("••••••")).toBeTruthy();
    expect(screen.getByText("Войти")).toBeTruthy();
  });

  //   it('показывает ошибку при невалидном email', async () => {
  //     renderLoginForm()
  //     const emailInput = screen.getByPlaceholderText('example@mail.com')
  //     const submitButton = screen.getByText('Войти')

  //     fireEvent.change(emailInput, { target: { value: 'notanemail' } })
  //     fireEvent.click(submitButton)

  //     await waitFor(() => {
  //       expect(screen.getByText('Неверный формат email')).toBeTruthy()
  //     })
  //   })

  it("показывает ошибку при невалидном email", async () => {
    renderLoginForm();
    const emailInput = screen.getByPlaceholderText("example@mail.com");
    const form = emailInput.closest("form")!;

    fireEvent.change(emailInput, { target: { value: "notanemail" } });
    fireEvent.submit(form); // ← ИЗМЕНЕНО: submit вместо click на кнопку

    await waitFor(() => {
      expect(screen.getByText("Неверный формат email")).toBeTruthy();
    });
  });

  it("показывает ошибку при коротком пароле", async () => {
    renderLoginForm();
    const emailInput = screen.getByPlaceholderText("example@mail.com");
    const passwordInput = screen.getByPlaceholderText("••••••");
    const submitButton = screen.getByText("Войти");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Пароль должен быть не менее 6 символов"),
      ).toBeTruthy();
    });
  });

  it("поля формы принимают ввод", () => {
    renderLoginForm();
    const emailInput = screen.getByPlaceholderText(
      "example@mail.com",
    ) as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText(
      "••••••",
    ) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("password123");
  });
});
