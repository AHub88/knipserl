import {
  IconCar,
  IconCurrencyEuro,
  IconList,
  IconLock,
  IconMail,
  IconMapPin,
} from "@tabler/icons-react";

export type SettingsLink = {
  title: string;
  href: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
};

export type SettingsSection = {
  title: string;
  items: SettingsLink[];
};

/** Zentrale Struktur für Settings-Übersicht + Sidebar-Flyout. */
export const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    title: "Stammdaten",
    items: [
      {
        title: "Startadresse",
        href: "/settings#startadresse",
        description: "Ausgangspunkt für die Entfernungsberechnung",
        icon: IconMapPin,
      },
      {
        title: "Google API",
        href: "/settings#google-api",
        description: "API-Keys, Place ID und OAuth-Verbindung",
        icon: IconLock,
      },
    ],
  },
  {
    title: "Preise & Positionen",
    items: [
      {
        title: "Fahrtkosten-Staffelung",
        href: "/settings/travel-pricing",
        description: "Preistabelle für Kundenfahrtkosten und Fahrervergütung",
        icon: IconCar,
      },
      {
        title: "Extras & Preise",
        href: "/settings/extras-pricing",
        description: "Preise für Fotobox und Extras bearbeiten",
        icon: IconCurrencyEuro,
      },
      {
        title: "Standard-Positionen",
        href: "/settings/standard-items",
        description: "Vordefinierte Positionen für Angebote und Rechnungen",
        icon: IconList,
      },
    ],
  },
  {
    title: "E-Mail",
    items: [
      {
        title: "Zugangsdaten",
        href: "/settings/email-credentials",
        description: "Microsoft Azure Credentials für den E-Mail-Versand",
        icon: IconLock,
        iconColor: "text-purple-400",
      },
      {
        title: "Templates",
        href: "/settings/email-templates",
        description: "Vorlagen für Bestätigungs- und Absagemails",
        icon: IconMail,
        iconColor: "text-blue-400",
      },
    ],
  },
];
