import { type PropsIcon } from "../types/PropsIcon";

export default function ChevronRightIcon({ width = 16, height, ...att }: PropsIcon) {
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
        d="m10.5 14.06-.53-.53-4.824-4.823a1 1 0 0 1 0-1.414L9.97 2.47l.53-.53L11.56 3l-.53.53L6.56 8l4.47 4.47.53.53-1.06 1.06Z"
        clipRule="evenodd"
      />
    </svg>
  )
}