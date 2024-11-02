import React, { createContext, useContext, useState } from 'react';

const ActiveRouteContext = createContext();

export const ActiveRouteProvider = ({ children }) => {
  const [activeRoute, setActiveRoute] = useState(null);

  return (
    <ActiveRouteContext.Provider value={{ activeRoute, setActiveRoute }}>
      {children}
    </ActiveRouteContext.Provider>
  );
};

export const useActiveRoute = () => useContext(ActiveRouteContext);
