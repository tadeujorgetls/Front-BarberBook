import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff, Lock, Email } from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";
import "./LoginPage.css";

export default function LoginPage() {
  const nav = useNavigate();
  const { signIn, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await signIn({ email, senha });
    nav("/cliente");
  }

  return (
    <Box className="login-bg">
      <Box className="login-container">
        <Paper elevation={8} className="login-card">
          <Box sx={{ textAlign: "center", mb: 1 }}>
            <Typography variant="h4" className="login-title">
              BarberBook
            </Typography>
            <Typography variant="body2" className="login-sub">
              Acesse sua conta
            </Typography>
            <span className="login-underline" />
          </Box>

          {error && (
            <Alert severity="error" className="login-alert">
              {error}
            </Alert>
          )}

          <form onSubmit={onSubmit} className="login-form">
            <TextField
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              variant="outlined"
              inputProps={{ "aria-label": "E-mail" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Senha"
              type={showPwd ? "text" : "password"}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              fullWidth
              variant="outlined"
              inputProps={{ "aria-label": "Senha" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPwd((s) => !s)}
                      edge="end"
                      size="small"
                      aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showPwd ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  size="small"
                />
              }
              label="Lembrar de mim"
              className="login-remember"
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              className="login-button"
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : "Entrar"}
            </Button>

            <Typography variant="caption" className="login-help">
              Esqueceu a senha? Fale com a recepção.
            </Typography>
          </form>
        </Paper>
      </Box>
    </Box>
  );
}