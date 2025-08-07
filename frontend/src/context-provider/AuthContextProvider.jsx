import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; // e.g., http://localhost:3000

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("auth-user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email, password) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error("Login failed");

      const data = await res.json(); // expected: { user, token }

      setUser(data.user);
      localStorage.setItem("auth-user", JSON.stringify(data.user));
      localStorage.setItem("auth-token", data.token);
      navigate("/");
    } catch (err) {
      alert("Login error: " + err.message);
    }
  };

  const signup = async (email, password) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error("Signup failed");

      const data = await res.json(); // expected: { user, token }

      setUser(data.user);
      localStorage.setItem("auth-user", JSON.stringify(data.user));
      localStorage.setItem("auth-token", data.token);
      navigate("/");
    } catch (err) {
      alert("Signup error: " + err.message);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth-user");
    localStorage.removeItem("auth-token");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
