import {
  IconHome,
  IconKey,
  IconLogout,
  IconSend,
  IconUserPlus,
} from "@tabler/icons-react";
import classes from "./navbar.module.css";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

function useData(role: "boss" | "employee" | "anon") {
  const t = useTranslations("navbar");

  const anonData = {
    main: [{ link: "/", label: t("home"), icon: IconHome }],
    footer: [{ link: "/auth/login", label: t("login"), icon: IconKey }],
  };

  const bossData = {
    main: [{ link: "/dashboard", label: t("dashboard"), icon: IconHome }],
    footer: [
      {
        link: "/auth/register-employee",
        label: t("registerEmployee"),
        icon: IconUserPlus,
      },
      { link: "/auth/logout", label: t("logout"), icon: IconLogout },
    ],
  };

  const employeeData = {
    main: [
      { link: "/dashboard", label: t("dashboard"), icon: IconHome },
      {
        link: "/progress/send",
        label: t("sendProgress"),
        icon: IconSend,
      },
    ],
    footer: [{ link: "/auth/logout", label: t("logout"), icon: IconLogout }],
  };

  if (role === "boss") return bossData;
  if (role === "employee") return employeeData;
  return anonData;
}

export type NavbarProps = {
  role: "boss" | "employee" | "anon";
  close: () => void;
};

export function Navbar({ role, close }: NavbarProps) {
  const pathname = usePathname();
  const data = useData(role);

  const mainLink = data.main.map((item) => (
    <Link
      className={classes.link}
      data-active={item.link === pathname || undefined}
      href={item.link}
      key={item.label}
      onClick={close}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </Link>
  ));

  const footerLinks = data.footer.map((item) => (
    <Link
      className={classes.link}
      data-active={item.link === pathname || undefined}
      href={item.link}
      key={item.label}
      onClick={close}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </Link>
  ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>{mainLink}</div>
      <div className={classes.footer}>{footerLinks}</div>
    </nav>
  );
}
