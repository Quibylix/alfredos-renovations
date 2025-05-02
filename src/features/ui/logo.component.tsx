"use client";

import { useMantineColorScheme } from "@mantine/core";
import Image from "next/image";

export function Logo() {
  const { colorScheme } = useMantineColorScheme();

  if (colorScheme === "light") {
    return (
      <Image src="/icon-light.png" alt="logo" width={40} height={40} priority />
    );
  }

  if (colorScheme === "dark") {
    return (
      <Image src="/icon-dark.png" alt="logo" width={40} height={40} priority />
    );
  }

  return (
    <picture
      style={{
        width: "40px",
        height: "40px",
      }}
    >
      <source srcSet="/icon-dark.png" media="(prefers-color-scheme: dark)" />
      <source srcSet="/icon-light.png" media="(prefers-color-scheme: light)" />
      <Image src="/icon-light.png" alt="logo" width={40} height={40} />
    </picture>
  );
}
