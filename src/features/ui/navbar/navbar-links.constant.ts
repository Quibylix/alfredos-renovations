import {
  Icon,
  IconHome,
  IconProps,
  IconSend,
  IconUserPlus,
  IconKey,
  IconBriefcase,
  IconProgress,
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
      label: "progress",
      icon: IconProgress,
      links: [{ link: "/progress", label: "progressList" }],
    },
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
      label: "progress",
      icon: IconProgress,
      links: [
        { link: "/progress", label: "progressList" },
        {
          link: "/progress/send",
          label: "sendProgress",
        },
      ],
    },
  ],
  footer: [],
};

export const anonLinks: NavbarLinks = {
  main: [{ link: "/", label: "home", icon: IconHome }],
  footer: [{ link: "/auth/login", label: "login", icon: IconKey }],
};
