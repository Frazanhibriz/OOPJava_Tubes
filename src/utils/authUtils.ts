import axios from "axios";

// Alamat base URL backend
const API_URL = "http://localhost:8080"; 

export async function login(
  username: string,
  password: string
): Promise<boolean> {
  console.log("authUtils - login: Attempting login for username:", username);
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      username: username,
      password: password,
    });

    console.log("authUtils - login: Response from server:", response);

    if (response.data && response.data.token) {
      localStorage.setItem("token", response.data.token);
      console.log(
        "authUtils - login: Token saved to localStorage:",
        response.data.token
      );
      return true;
    } else {
      console.warn(
        "authUtils - login: Login successful but no token in response data.",
        response.data
      );
      return false;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "authUtils - login: Axios error during login:",
        error.response?.data || error.message
      );
      if (error.response) {
        console.error("authUtils - login: Status code:", error.response.status);
        console.error("authUtils - login: Headers:", error.response.headers);
      } else if (error.request) {
        console.error(
          "authUtils - login: No response received, request was made:",
          error.request
        );
      } else {
        console.error(
          "authUtils - login: Error setting up request:",
          error.message
        );
      }
    } else {
      console.error("authUtils - login: Non-Axios error during login:", error);
    }
    return false;
  }
}

export function logout(): void {
  const token = localStorage.getItem("token");
  localStorage.removeItem("token");
  console.log(
    "authUtils - logout: Token removed from localStorage. Previous token (if any):",
    token
  );
}

export function isLoggedIn(): boolean {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");

    return !!token;
  }

  return false;
}

export function getToken(): string | null {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    return token;
  }
  return null;
}
