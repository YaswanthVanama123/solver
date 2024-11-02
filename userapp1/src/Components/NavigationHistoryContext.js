import React, { createContext, useState, useContext } from 'react';

const NavigationHistoryContext = createContext();

export const NavigationHistoryProvider = ({ children }) => {
  const [history, setHistory] = useState([]);

  const addToHistory = (screenName, params) => {
    setHistory(prevHistory => [...prevHistory, { screenName, params }]);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const getLastScreen = () => {
    return history[history.length - 1];
  };

  return (
    <NavigationHistoryContext.Provider value={{ addToHistory, clearHistory, getLastScreen }}>
      {children}
    </NavigationHistoryContext.Provider>
  );
};

export const useNavigationHistory = () => useContext(NavigationHistoryContext);
