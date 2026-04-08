import { Outlet } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";

export default function AppShell() {
  return (
    <>
      <div className="lang-bar">
        <LanguageSwitcher />
      </div>
      <Outlet />
    </>
  );
}
