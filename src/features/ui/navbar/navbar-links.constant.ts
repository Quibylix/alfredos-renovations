import {
  Icon,
  IconHome,
  IconProps,
  IconUserPlus,
  IconKey,
  IconBriefcase,
  IconProgress,
  IconPasswordUser,
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
      label: "projects",
      icon: IconBriefcase,
      links: [
        {
          label: "projectsList",
          link: "/projects",
        },
        {
          label: "createProject",
          link: "/projects/create",
        },
      ],
    },
  ],
  footer: [
    {
      link: "/auth/register-employee",
      label: "registerEmployee",
      icon: IconUserPlus,
    },
    {
      link: "/auth/change-password",
      label: "changePassword",
      icon: IconPasswordUser,
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
    {
      label: "projects",
      icon: IconBriefcase,
      links: [
        {
          label: "projectsList",
          link: "/projects",
        },
      ],
    },
  ],
  footer: [
    {
      link: "/auth/change-password",
      label: "changePassword",
      icon: IconPasswordUser,
    },
  ],
};

export const anonLinks: NavbarLinks = {
  main: [{ link: "/", label: "home", icon: IconHome }],
  footer: [{ link: "/auth/login", label: "login", icon: IconKey }],
};
