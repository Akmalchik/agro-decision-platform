import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { defaultLocale, isLocale, localeCookieName, localePathSegments } from "@/i18n/config";

export default async function RootPage() {
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get(localeCookieName)?.value;
  const locale = savedLocale && isLocale(savedLocale) ? savedLocale : defaultLocale;
  redirect(`/${localePathSegments[locale]}`);
}
