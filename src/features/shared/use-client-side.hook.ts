import { useEffect, useState } from "react";

export function useClientSide() {
  const [clientSide, setClientSide] = useState(false);

  useEffect(() => {
    const isServer = typeof window === "undefined";
    if (!isServer) {
      setClientSide(true);
    }

    return () => {
      setClientSide(false);
    };
  }, [setClientSide]);

  return clientSide;
}
