export type Topic = {
  name: string;
  icon: string;
};

export const topics: Topic[] = [
  {
    name: "development",
    icon: "code-slash-outline",
  },
  {
    name: "comedy",
    icon: "happy-outline",
  },
  {
    name: "gaming",
    icon: "game-controller-outline",
  },
  {
    name: "food",
    icon: "restaurant-outline",
  },
  {
    name: "dance",
    icon: "musical-notes-outline",
  },
  {
    name: "beauty",
    icon: "color-palette-outline",
  },
  {
    name: "animals",
    icon: "paw-outline",
  },
  {
    name: "sports",
    icon: "trophy-outline",
  },
  {
    name: "Other",
    icon: "ellipsis-horizontal-circle-outline",
  },
];

export const footerLinks = [
  {
    title: "Company",
    links: [
      { label: "About", path: "/legal/about" },
      { label: "Newsroom", path: "/legal/newsroom" },
      { label: "Contact", path: "/legal/contact" },
      { label: "Careers", path: "/legal/careers" },
    ],
  },
  {
    title: "Programs",
    links: [
      { label: "Advertise", path: "/advertise" },
      { label: "Developers", path: "/legal/developers" },
      { label: "Creator Portal", action: "creator-portal" },
    ],
  },
  {
    title: "Legal & Safety",
    links: [
      { label: "Help", path: "/legal/help" },
      { label: "Safety", path: "/legal/safety" },
      { label: "Terms", path: "/legal/about" },
      { label: "Privacy", path: "/legal/about" },
      { label: "Community Guidelines", path: "/legal/safety" },
    ],
  },
];