const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export type LoginRequest = { email: string; senha: string };
export type RegisterRequest = { nome: string; cpf: string; email: string; telefone: string; senha: string };

export type UserView = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  role: string;
};

export type LoginResponse = { token: string; user: UserView };

function emitAuthChanged() {
  window.dispatchEvent(new CustomEvent("bb-auth-changed"));
}

export async function login(req: LoginRequest): Promise<LoginResponse> {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error((await res.text()) || "Falha no login");
  return res.json();
}

export async function register(req: RegisterRequest): Promise<LoginResponse> {
  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error((await res.text()) || "Falha no cadastro");
  return res.json();
}

export function saveSession(data: LoginResponse) {
  localStorage.setItem("bb_token", data.token);
  localStorage.setItem("bb_user", JSON.stringify(data.user));
  emitAuthChanged();
}

export function getUser(): UserView | null {
  const raw = localStorage.getItem("bb_user");
  return raw ? (JSON.parse(raw) as UserView) : null;
}

export function clearSession() {
  localStorage.removeItem("bb_token");
  localStorage.removeItem("bb_user");
  emitAuthChanged();
}