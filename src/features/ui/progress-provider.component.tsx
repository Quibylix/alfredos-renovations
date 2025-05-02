"use client";

import { ProgressProvider as BaseProgressProvider } from "@bprogress/next/app";

export type ProgressProviderProps = {
  children: React.ReactNode;
};

export function ProgressProvider({ children }: ProgressProviderProps) {
  return (
    <BaseProgressProvider
      height="3px"
      options={{
        showSpinner: false,
      }}
      color="#1971c2"
    >
      {children}
    </BaseProgressProvider>
  );
}
