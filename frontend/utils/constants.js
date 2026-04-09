import { BsCode, BsEmojiSunglasses } from "react-icons/bs";
import { GiCakeSlice, GiGalaxy, GiLipstick } from "react-icons/gi";
import { FaPaw, FaMedal, FaGamepad } from "react-icons/fa";

import { Other } from "../components/icon/Other";

export const topics = [
  {
    name: "development",
    icon: <BsCode />,
  },
  {
    name: "comedy",
    icon: <BsEmojiSunglasses />,
  },
  {
    name: "gaming",
    icon: <FaGamepad />,
  },
  {
    name: "food",
    icon: <GiCakeSlice />,
  },
  {
    name: "dance",
    icon: <GiGalaxy />,
  },
  {
    name: "beauty",
    icon: <GiLipstick />,
  },
  {
    name: "animals",
    icon: <FaPaw />,
  },
  {
    name: "sports",
    icon: <FaMedal />,
  },
  {
    name: "Other",
    icon: <Other />,
  },
];

export const footerLinks = [
  {
    title: "Company",
    links: [
      { label: "About", path: "/about" },
      { label: "Newsroom", path: "/newsroom" },
      { label: "Contact", path: "/contact" },
      { label: "Careers", path: "/careers" },
    ],
  },
  {
    title: "Programs",
    links: [
      { label: "Advertise", path: "/advertise" },
      { label: "Developers", path: "/developers" },
      { label: "Creator Portal", action: "creator-portal" },
    ],
  },
  {
    title: "Legal & Safety",
    links: [
      { label: "Help", path: "/help" },
      { label: "Safety", path: "/safety" },
      { label: "Terms", path: "/legal" },
      { label: "Privacy", path: "/legal" },
      { label: "Community Guidelines", path: "/legal" },
    ],
  },
];

