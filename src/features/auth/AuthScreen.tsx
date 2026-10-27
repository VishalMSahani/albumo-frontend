"use client";

import MobileAuthScreen from "./MobileAuthScreen";
import PasswordAuthScreen, { type PasswordMode } from "./PasswordAuthScreen";

export default function AuthScreen({
  initialMode = "login",
}: {
  initialMode?: PasswordMode;
}) {
  return initialMode === "login" || initialMode === "register" ? (
    <MobileAuthScreen />
  ) : (
    <PasswordAuthScreen initialMode={initialMode} />
  );
}
