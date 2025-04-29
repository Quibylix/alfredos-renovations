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
import { useLogout } from "../auth/logout/use-logout.hook";

function useData(
  role: "boss" | "employee" | "anon",
  t: ReturnType<typeof useTranslations<"navbar">>,
) {
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
    footer: [],
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
  const t = useTranslations("navbar");
  const pathname = usePathname();

  const data = useData(role, t);
  const { logout } = useLogout();

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
      <div className={classes.footer}>
        {footerLinks}
        {role !== "anon" && (
          <button
            className={classes.link}
            onClick={(e) => {
              e.preventDefault();

              close();
              logout();
            }}
          >
            <IconLogout className={classes.linkIcon} stroke={1.5} />
            <span>{t("logout")}</span>
          </button>
        )}
      </div>
    </nav>
  );
}
