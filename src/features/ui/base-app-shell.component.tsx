"use client";

import { AppShell, Burger, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconBackhoe } from "@tabler/icons-react";
import { Navbar } from "./navbar/navbar.component";

export type BaseAppShellProps = {
  role: "boss" | "employee" | "anon";
  children: React.ReactNode;
};

export function BaseAppShell({ role, children }: BaseAppShellProps) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger
            opened={mobileOpened}
            onClick={toggleMobile}
            hiddenFrom="sm"
            size="sm"
          />
          <Burger
            opened={desktopOpened}
            onClick={toggleDesktop}
            visibleFrom="sm"
            size="sm"
          />
          <IconBackhoe size={30} />
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <Navbar role={role} close={() => mobileOpened && toggleMobile()} />
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
