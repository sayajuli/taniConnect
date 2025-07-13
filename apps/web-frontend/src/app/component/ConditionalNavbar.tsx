'use client';

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

const pathToHideNavbar = ['/login', '/register'];

export default function ConditionalNavbar() {
  const pathname = usePathname();

  if (pathToHideNavbar.includes(pathname)) {
    return null;
  }

  return <Navbar />;
}