import { IconLogout } from "@tabler/icons-react";
import classes from "./navbar.module.css";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLogout } from "../../auth/logout/use-logout.hook";
import { bossLinks, employeeLinks, anonLinks } from "./navbar-links.constant";
import { NavbarLinksGroup } from "./navbar-links-group.component";
import { UserRole } from "@/features/db/user/user.constant";

function getLinks(role: UserRole) {
  if (role === "boss") return bossLinks;
  if (role === "employee") return employeeLinks;
  return anonLinks;
}

export type NavbarProps = {
  role: UserRole;
  close: () => void;
};

export function Navbar({ role, close }: NavbarProps) {
  const t = useTranslations("navbar");
  const pathname = usePathname();

  const navbarLinks = getLinks(role);
  const { logout } = useLogout();

  const mainLink = navbarLinks.main.map((item) =>
    "links" in item ? (
      <NavbarLinksGroup
        close={close}
        icon={item.icon}
        label={item.label}
        links={item.links}
        key={item.label}
      />
    ) : (
      <Link
        className={classes.link}
        data-active={item.link === pathname || undefined}
        href={item.link}
        key={item.label}
        onClick={close}
      >
        <item.icon className={classes.linkIcon} stroke={1.5} />
        <span>{t(item.label)}</span>
      </Link>
    ),
  );

  const footerLinks = navbarLinks.footer.map((item) =>
    "links" in item ? (
      <NavbarLinksGroup
        close={close}
        icon={item.icon}
        label={item.label}
        links={item.links}
        key={item.label}
      />
    ) : (
      <Link
        className={classes.link}
        data-active={item.link === pathname || undefined}
        href={item.link}
        key={item.label}
        onClick={close}
      >
        <item.icon className={classes.linkIcon} stroke={1.5} />
        <span>{t(item.label)}</span>
      </Link>
    ),
  );

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
