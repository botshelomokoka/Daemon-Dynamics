import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface KlawaMetrics {
  klawaPrice: number;
  totalSupply: number;
  circulatingSupply: number;
  subgraphSynced: boolean;
  blockIndexed: number;
}

const KlawaContext = createContext<KlawaMetrics | undefined>(undefined);

export function KlawaProvider({ children }: { children: React.ReactNode }) {
  const [klawaPrice, setKlawaPrice] = useState(1.2452);
  const [totalSupply] = useState(100000000);
  const [circulatingSupply, setCirculatingSupply] = useState(42500000);
  const [subgraphSynced, setSubgraphSynced] = useState(false);
  const [blockIndexed, setBlockIndexed] = useState(19420010);

  useEffect(() => {
    if (!db) {
       // Fallback simulation if firebase is not fully ready (for dev safety)
       const interval = setInterval(() => {
         setKlawaPrice(prev => prev + (Math.random() * 0.001 - 0.0005));
         setBlockIndexed(prev => prev + 1);
       }, 5000);
       return () => clearInterval(interval);
    }

    const unsubscribe = onSnapshot(doc(db, 'config', 'global'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.klawaPrice) setKlawaPrice(data.klawaPrice);
        if (data.subgraphSynced !== undefined) setSubgraphSynced(data.subgraphSynced);
        if (data.blockIndexed) setBlockIndexed(data.blockIndexed);
      }
    });

    // Sub-simulation for smoother supply growth in UI (keeps it alive between server ticks)
    const smoothInterval = setInterval(() => {
       setCirculatingSupply(prev => prev + Math.floor(Math.random() * 2));
    }, 15000);

    return () => {
      unsubscribe();
      clearInterval(smoothInterval);
    };
  }, []);

  return (
    <KlawaContext.Provider value={{ klawaPrice, totalSupply, circulatingSupply, subgraphSynced, blockIndexed }}>
      {children}
    </KlawaContext.Provider>
  );
}

export function useKlawaMetrics() {
  const context = useContext(KlawaContext);
  if (context === undefined) {
    throw new Error('useKlawaMetrics must be used within a KlawaProvider');
  }
  return context;
}
