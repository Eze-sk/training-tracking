import { type PropsIcon } from "../types/PropsIcon";

export default function MenuIcon({ width = 16, height, ...att }: PropsIcon) {
  return (
    <svg
      {...att}
      width={width}
      height={height ? height : width}
      viewBox="0 0 16 16"
      strokeLinejoin="round"
      style={{ color: "currentcolor" }}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M1.75 4H1v1.5h14V4zm0 6.5H1V12h14v-1.5z"
        clipRule="evenodd"
      />
    </svg>
  )
}
