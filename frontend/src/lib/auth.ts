import { User } from "@/types";

export const getUser = (): User | null => {
  if (typeof window === "undefined") return null;
  const u = localStorage.getItem("lms_user");
  return u ? JSON.parse(u) : null;
};

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("lms_token");
};

export const setAuth = (token: string, user: User) => {
  localStorage.setItem("lms_token", token);
  localStorage.setItem("lms_user", JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem("lms_token");
  localStorage.removeItem("lms_user");
};

export const isAuthenticated = (): boolean => !!getToken();