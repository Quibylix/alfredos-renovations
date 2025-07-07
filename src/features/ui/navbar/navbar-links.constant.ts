import { AppRoutes } from "@/features/shared/app-routes.util";
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
    { link: AppRoutes.getRoute("HOME"), label: "dashboard", icon: IconHome },
    {
      label: "tasks",
      icon: IconProgress,
      links: [
        { link: AppRoutes.getRoute("PROGRESS_LIST"), label: "taskList" },
        {
          link: AppRoutes.getRoute("SEND_PROGRESS"),
          label: "setTask",
        },
      ],
    },
    {
      label: "projects",
      icon: IconBriefcase,
      links: [
        {
          label: "projectsList",
          link: AppRoutes.getRoute("PROJECT_LIST"),
        },
        {
          label: "createProject",
          link: AppRoutes.getRoute("CREATE_PROJECT"),
        },
      ],
    },
  ],
  footer: [
    {
      link: AppRoutes.getRoute("REGISTER_EMPLOYEE"),
      label: "registerEmployee",
      icon: IconUserPlus,
    },
    {
      link: AppRoutes.getRoute("CHANGE_PASSWORD"),
      label: "changePassword",
      icon: IconPasswordUser,
    },
  ],
};

export const employeeLinks: NavbarLinks = {
  main: [
    { link: AppRoutes.getRoute("HOME"), label: "dashboard", icon: IconHome },
    {
      label: "tasks",
      icon: IconProgress,
      links: [{ link: AppRoutes.getRoute("PROGRESS_LIST"), label: "taskList" }],
    },
    {
      label: "projects",
      icon: IconBriefcase,
      links: [
        {
          label: "projectsList",
          link: AppRoutes.getRoute("PROJECT_LIST"),
        },
      ],
    },
  ],
  footer: [
    {
      link: AppRoutes.getRoute("CHANGE_PASSWORD"),
      label: "changePassword",
      icon: IconPasswordUser,
    },
  ],
};

export const anonLinks: NavbarLinks = {
  main: [{ link: AppRoutes.getRoute("HOME"), label: "home", icon: IconHome }],
  footer: [
    { link: AppRoutes.getRoute("LOGIN"), label: "login", icon: IconKey },
  ],
};
