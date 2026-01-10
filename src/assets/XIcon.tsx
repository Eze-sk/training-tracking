import { type PropsIcon } from '../types/PropsIcon'

export default function XIcon({ height, width = 24, ...att }: PropsIcon) {
  return (
    <svg
      {...att}
      width={width}
      height={height ? height : width}
      viewBox="0 0 224.23 221.197"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="20"
        d="M9.998 11.284c80.55 78.82 157.94 153.49 204.23 197.8M13.338 10.004c46.17 49.97 92.08 95.95 197.74 200.15"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="20"
        d="M11.878 209.474c74-73.32 154.05-154.03 200.87-198.42m-201.08 200.14c44.02-40.67 87.99-82.31 201.05-199.03"
      />
    </svg>
  )
}
