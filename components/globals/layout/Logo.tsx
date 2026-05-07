import { useId } from "react";
import styles from "./Logo.module.css";

interface LogoProps {
  className?: string;
}

export const Logo = ({ className }: LogoProps) => {
  const gradientId = useId();

  return (
    <svg
      viewBox="0 0 56 56"
      xmlns="http://www.w3.org/2000/svg"
      className={`${styles.logo} ${className ?? ""}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F24E4E" />   {/* --color-coral-red */}
          <stop offset="50%" stopColor="#A64EF2" />  {/* --color-amethyst */}
          <stop offset="100%" stopColor="#4E8CF2" /> {/* --color-ocean-blue */}
        </linearGradient>
      </defs>
      <path
        d="M13.5 3.375l27 0 10.125 10.125 0 27-10.125 10.125-27 0-10.125-10.125 0-27z m13.5 5.0625l15.1875 15.1875 0 18.5625-30.375 0 0-18.5625z m0 10.125l7.59375 7.59375-15.1875 0z m-7.59375 9.28125l15.1875 0-7.59375 7.59375z"
        fill={`url(#${gradientId})`}
        fillRule="evenodd"
      />
    </svg>
  );
};
