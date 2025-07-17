"use client";

import { useFcmToken } from "./use-fcm-token.hook";

export type RegisterFCMTokenProps = {
  isLogged: boolean;
};

export function RegisterFCMToken({ isLogged }: RegisterFCMTokenProps) {
  useFcmToken(isLogged);

  return null;
}
