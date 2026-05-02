import { createContext, useContext, useState } from 'react';
const DesignContext = createContext(null);
export function DesignProvider({ children }) {
  const [design, setDesign] = useState(() => localStorage.getItem('eumjinin-design') || 'default');
  const selectDesign = (d) => { localStorage.setItem('eumjinin-design', d); setDesign(d); };
  return <DesignContext.Provider value={{ design, setDesign: selectDesign }}>{children}</DesignContext.Provider>;
}
export function useDesign() { return useContext(DesignContext); }
