import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getUser, createUser, validateUser, updateUser,
  getSession, setSession, clearSession,
  getCart, saveCart, getPurchased, savePurchased,
  getUserPrefs, saveUserPrefs, updateUserProfile,
} from '../utils/storage';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const navigate = useNavigate();

  // ─── Auth ──────────────────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(() => getSession());

  // ─── Cart ──────────────────────────────────────────────────────────────────
  const [cartItems, setCartItems] = useState(() => {
    const s = getSession();
    return s ? getCart(s.userId) : [];
  });

  // ─── Dark mode ─────────────────────────────────────────────────────────────
  const [isDark, setIsDark] = useState(() => {
    const s = getSession();
    if (s) return getUserPrefs(s.userId).darkMode ?? true;
    const global = localStorage.getItem('ro_dark_mode');
    return global !== null ? global === 'true' : true;
  });

  // ─── Toast ─────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);

  // Reload cart + prefs when user changes
  useEffect(() => {
    if (currentUser) {
      setCartItems(getCart(currentUser.userId));
      const mode = getUserPrefs(currentUser.userId).darkMode ?? true;
      setIsDark(mode);
      localStorage.setItem('ro_dark_mode', String(mode));
    } else {
      setCartItems([]);
    }
  }, [currentUser?.userId]);

  // ─── Auth actions ──────────────────────────────────────────────────────────
  const signup = useCallback(async (name, email, password) => {
    if (getUser(email)) return { error: 'An account with this email already exists.' };
    const user = createUser({ name, email, password });
    const session = { userId: user.id, email: user.email, name: user.name };
    setSession(user);
    setCurrentUser(session);
    navigate('/home', { replace: true });
    return { error: null };
  }, [navigate]);

  const login = useCallback(async (email, password) => {
    const user = validateUser(email, password);
    if (!user) return { error: 'Invalid email or password.' };
    const session = { userId: user.id, email: user.email, name: user.name };
    setSession(user);
    setCurrentUser(session);
    navigate('/home', { replace: true });
    return { error: null };
  }, [navigate]);

  const logout = useCallback(() => {
    clearSession();
    setCurrentUser(null);
    setCartItems([]);
    navigate('/auth', { replace: true });
  }, [navigate]);

  const updateDisplayName = useCallback((name) => {
    if (!currentUser) return;
    updateUser(currentUser.userId, { name });
    const updated = { ...currentUser, name };
    sessionStorage.setItem('ro_session', JSON.stringify(updated));
    setCurrentUser(updated);
  }, [currentUser]);

  // Update both name and/or email (used by EditProfileScreen)
  const updateProfile = useCallback(({ name, email }) => {
    if (!currentUser) return;
    updateUserProfile(currentUser.userId, { name, email });
    const updated = {
      ...currentUser,
      ...(name ? { name } : {}),
      ...(email ? { email: email.toLowerCase() } : {}),
    };
    sessionStorage.setItem('ro_session', JSON.stringify(updated));
    setCurrentUser(updated);
  }, [currentUser]);

  // Sync dark mode class on document.body whenever isDark changes
  useEffect(() => {
    document.body.classList.toggle('light-mode', !isDark);
  }, [isDark]);

  // ─── Dark mode toggle ──────────────────────────────────────────────────────
  const toggleDark = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem('ro_dark_mode', String(next));
      if (currentUser) saveUserPrefs(currentUser.userId, { darkMode: next });
      return next;
    });
  }, [currentUser]);

  // ─── Cart actions ──────────────────────────────────────────────────────────
  const addToCart = useCallback((course) => {
    setCartItems(prev => {
      if (prev.find(c => c.id === course.id)) return prev;
      const next = [...prev, course];
      if (currentUser) saveCart(currentUser.userId, next);
      return next;
    });
  }, [currentUser]);

  const removeFromCart = useCallback((courseId) => {
    setCartItems(prev => {
      const next = prev.filter(c => c.id !== courseId);
      if (currentUser) saveCart(currentUser.userId, next);
      return next;
    });
  }, [currentUser]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    if (currentUser) saveCart(currentUser.userId, []);
  }, [currentUser]);

  const isInCart = useCallback((courseId) => {
    return cartItems.some(c => c.id === courseId);
  }, [cartItems]);

  const cartTotal = cartItems.reduce((sum, c) => sum + (c.price || 0), 0);

  // Moves cartItems + any extraItems into the purchased list, then clears cart
  const purchase = useCallback((extraItems = []) => {
    if (!currentUser) return;
    const all = [...cartItems];
    extraItems.forEach(item => { if (!all.find(i => i.id === item.id)) all.push(item); });
    const existing = getPurchased(currentUser.userId);
    const merged = [...existing];
    all.forEach(item => { if (!merged.find(p => p.id === item.id)) merged.push(item); });
    savePurchased(currentUser.userId, merged);
    saveCart(currentUser.userId, []);
    setCartItems([]);
    sessionStorage.removeItem('ro_order_summary');
  }, [currentUser, cartItems]);

  // ─── Toast ─────────────────────────────────────────────────────────────────
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  return (
    <AppContext.Provider value={{
      // auth
      currentUser,
      isAuthenticated: !!currentUser,
      signup,
      login,
      logout,
      updateDisplayName,
      updateProfile,
      // dark mode
      isDark,
      toggleDark,
      // cart
      cartItems,
      addToCart,
      removeFromCart,
      clearCart,
      isInCart,
      cartTotal,
      purchase,
      // toast
      toast,
      showToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
export const useAuth = () => useContext(AppContext);
export const useCart = () => useContext(AppContext);
