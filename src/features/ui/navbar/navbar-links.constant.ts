import {
  Icon,
  IconHome,
  IconProps,
  IconSend,
  IconUserPlus,
  IconKey,
  IconBriefcase,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { ForwardRefExoticComponent, RefAttributes } from "react";

export type NavbarLinks = {
  main: (NavbarGroup | NavbarLinkWithIcon)[];
  footer: (NavbarGroup | NavbarLinkWithIcon)[];
};

export type NavbarGroup = {
  label: Parameters<ReturnType<typeof useTranslations<"navbar">>>[0];
  icon: ForwardRefExoticComponent<IconProps & RefAttributes<Icon>>;
  links: NavbarLink[];
};

export type NavbarLink = {
  link: string;
  label: Parameters<ReturnType<typeof useTranslations<"navbar">>>[0];
};

export type NavbarLinkWithIcon = NavbarLink & {
  icon: ForwardRefExoticComponent<IconProps & RefAttributes<Icon>>;
};

export const bossLinks: NavbarLinks = {
  main: [
    { link: "/", label: "dashboard", icon: IconHome },
    {
      label: "createProject",
      icon: IconBriefcase,
      link: "/projects/create",
    },
  ],
  footer: [
    {
      link: "/auth/register-employee",
      label: "registerEmployee",
      icon: IconUserPlus,
    },
  ],
};

export const employeeLinks: NavbarLinks = {
  main: [
    { link: "/", label: "dashboard", icon: IconHome },
    {
      link: "/progress/send",
      label: "sendProgress",
      icon: IconSend,
    },
  ],
  footer: [],
};

export const anonLinks: NavbarLinks = {
  main: [{ link: "/", label: "home", icon: IconHome }],
  footer: [{ link: "/auth/login", label: "login", icon: IconKey }],
};
