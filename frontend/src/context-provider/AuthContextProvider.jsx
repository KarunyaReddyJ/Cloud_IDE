import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; // e.g., http://localhost:3000

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(() => {
    const user = localStorage.getItem("auth-user");
    const token = localStorage.getItem("auth-token");
    return user && token ? { user: JSON.parse(user), token } : null;
  });

  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error("Login failed");

      const data = await res.json(); // expected: { user, token }
      console.log("logged", data);
      setUserData(data);
      setLoading(false);
      localStorage.setItem("auth-user", JSON.stringify(data.user));
      localStorage.setItem("auth-token", data.token);
      navigate("/");
    } catch (err) {
      setLoading(false);
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

      setUserData(data);
      localStorage.setItem("auth-user", JSON.stringify(data.user));
      localStorage.setItem("auth-token", data.token);
      navigate("/");
    } catch (err) {
      alert("Signup error: " + err.message);
    }
  };

  const logout = () => {
    setUserData(null);
    localStorage.removeItem("auth-user");
    localStorage.removeItem("auth-token");
    navigate("/login");
  };

  const authFetch = (endpoint, options = {}) => {
    console.info(`making req to ${BACKEND_URL}${endpoint}`)
    return fetch(`${BACKEND_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${userData?.token}`,
        "Content-Type": "application/json",
      },
    });
  };
  return (
    <AuthContext.Provider
      value={{ loading, userData, login, signup, logout, authFetch }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
