import { useState } from "react";
import {
  login, register, saveSession,
  type LoginRequest, type RegisterRequest,
  type LoginResponse
} from "../services/auth";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  async function signIn(payload: LoginRequest): Promise<LoginResponse> {
    setError(null); setLoading(true);
    try {
      const resp = await login(payload);
      saveSession(resp);
      return resp;
    } catch (e:any) {
      setError(e.message || "Erro ao autenticar");
      throw e;
    } finally { setLoading(false); }
  }

  async function signUp(payload: RegisterRequest): Promise<LoginResponse> {
    setError(null); setLoading(true);
    try {
      const resp = await register(payload);
      saveSession(resp);
      return resp;
    } catch (e:any) {
      setError(e.message || "Erro ao cadastrar");
      throw e;
    } finally { setLoading(false); }
  }

  return { signIn, signUp, loading, error, setError };
}