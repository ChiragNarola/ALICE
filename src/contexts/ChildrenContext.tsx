import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { ChildInfo } from '../routes/models/request/Child';

type ChildrenContextType = {
  children: ChildInfo[];
  updateChild: (index: number, updated: Partial<ChildInfo>) => void;
  addChild: () => void;
  deleteChild: (index: number) => void;
};

const ChildrenContext = createContext<ChildrenContextType | undefined>(undefined);

export const ChildrenProvider = ({ children: node }: { children: ReactNode }) => {
  const [children, setChildren] = useState<ChildInfo[]>([
    {
      firstName: '',
      middleName: '',
      lastName: '',
      gender: 'Boy',
      dob: '',
      topics: [],
      concerns: [],
    },
  ]);

  const updateChild = (index: number, updated: Partial<ChildInfo>) => {
    setChildren((prev) =>
      prev.map((child, i) => (i === index ? { ...child, ...updated } : child))
    );
  };

  const addChild = () => {
    setChildren((prev) => [
      ...prev,
      {
        firstName: '',
        middleName: '',
        lastName: '',
        gender: 'Boy',
        dob: '',
        topics: [],
        concerns: [],
      },
    ]);
  };

  const deleteChild = (index: number) => {
    setChildren((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <ChildrenContext.Provider value={{ children, updateChild, addChild, deleteChild }}>
      {node}
    </ChildrenContext.Provider>
  );
};

export const useChildren = () => {
  const context = useContext(ChildrenContext);
  if (!context) throw new Error('useChildren must be used within a ChildrenProvider');
  return context;
};
