export type SocialPlatform = "facebook" | "instagram" | "youtube" | "whatsapp";
export type SocialProfile = {
  platform: SocialPlatform;
  label: string;
  href?: string;
};

function profileUrl(value: string | undefined, hosts: string[]) {
  if (!value?.trim()) return undefined;
  try {
    const url = new URL(value.trim());
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.port ||
      !hosts.includes(url.hostname) ||
      url.pathname === "/"
    )
      return undefined;
    return url.href;
  } catch {
    return undefined; 
  }
}

export const socialProfiles: SocialProfile[] = [
  {
    platform: "facebook",
    label: "Facebook",
    href: profileUrl(process.env.NEXT_PUBLIC_FACEBOOK_URL, [
      "facebook.com",
      "www.facebook.com",
      "m.facebook.com",
    ]),
  },
  {
    platform: "instagram",
    label: "Instagram",
    href: profileUrl("https://www.instagram.com/albumo.in/", [
      "instagram.com",
      "www.instagram.com",
    ]),
  },
  {
    platform: "youtube",
    label: "YouTube",
    href: profileUrl("https://www.youtube.com/channel/UCqcZS0pMcszuWQRsxfwCd2A", [
      "youtube.com",
      "www.youtube.com",
    ]),
  },
];
