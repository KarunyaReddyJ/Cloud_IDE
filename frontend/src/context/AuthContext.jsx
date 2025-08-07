import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export default AuthContext
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('auth-user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = (email, password) => {
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
    const matchedUser = storedUsers.find(u => u.email === email && u.password === password);

    if (matchedUser) {
      setUser(matchedUser);
      localStorage.setItem('auth-user', JSON.stringify(matchedUser));
      navigate('/');
    } else {
      alert('Invalid credentials');
    }
  };

  const signup = (email, password) => {
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
    if (storedUsers.find(u => u.email === email)) {
      alert('User already exists!');
      return;
    }

    const newUser = { email, password };
    storedUsers.push(newUser);
    localStorage.setItem('users', JSON.stringify(storedUsers));
    login(email, password);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth-user');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

