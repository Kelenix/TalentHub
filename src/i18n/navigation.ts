import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Wrappers de navigation localisés (Link, useRouter, redirect…)
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
