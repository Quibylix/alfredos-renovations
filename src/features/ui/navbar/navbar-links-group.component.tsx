import { useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Box, Collapse, Group, UnstyledButton } from "@mantine/core";
import { NavbarGroup } from "./navbar-links.constant";
import classes from "./navbar-links-group.module.css";
import { IconChevronRight } from "@tabler/icons-react";

export type LinksGroupProps = {
  close: () => void;
} & NavbarGroup;

export function NavbarLinksGroup({
  icon: Icon,
  label,
  links,
  close,
}: LinksGroupProps) {
  const t = useTranslations("navbar");
  const pathname = usePathname();

  const [opened, setOpened] = useState(false);

  const items = links.map((item) => (
    <Link
      className={classes.link}
      data-active={item.link === pathname || undefined}
      href={item.link}
      key={item.label}
      onClick={close}
    >
      {t(item.label)}
    </Link>
  ));

  return (
    <>
      <UnstyledButton
        onClick={() => setOpened((o) => !o)}
        className={classes.control}
      >
        <Group justify="space-between" gap={0}>
          <Box style={{ display: "flex", alignItems: "center" }}>
            <Icon className={classes.icon} stroke={1.5} />
            <Box ml="md">{t(label)}</Box>
          </Box>
          <IconChevronRight
            className={classes.chevron}
            stroke={1.5}
            size={16}
            style={{ transform: opened ? "rotate(-90deg)" : "none" }}
          />
        </Group>
      </UnstyledButton>
      {<Collapse in={opened}>{items}</Collapse>}
    </>
  );
}
