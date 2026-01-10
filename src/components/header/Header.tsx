import { useEffect, useRef, useState } from "react";
import Flame from "../../assets/Flame";
import { TrainingDay, UserMetadataType } from "../../types/UserMetadata";
import StreakMenu from "./StreaksMenu";
import MenuIcon from "../../assets/Menu";
import UserMenu from "./UserMenu";
import { isWithinInterval, set } from "date-fns";

export interface Props {
  metadata: UserMetadataType | null
  weekDays: TrainingDay[] | null
}

export interface StreakLevelType {
  style: string,
  message: string,
  shortMessage?: string,
}

export type StreakLevel = "initial" | "constancy" | "presidency" | "advanced" | "dangerous"

export default function Header({ metadata, weekDays }: Props) {
  const [openStreakMenu, setOpenStreakMenu] = useState(false)
  const [openUserMenu, setOpenUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const streakLevelStyles: Record<StreakLevel, StreakLevelType> = {
    initial: {
      style: "text-txt-secondary",
      message: "Get started now and activate your streak today!",
      shortMessage: "No active streak",
    },
    constancy: {
      style: "text-br-primary",
      message: "Good rhythm! Stay consistent and don't stop.",
      shortMessage: `${metadata?.current_streak} day streak`,
    },
    presidency: {
      style: "text-txt-primary",
      message: "Total dominance! You are forging a habit of steel.",
      shortMessage: `${metadata?.current_streak} day streak 🔥`,
    },
    advanced: {
      style: "text-acc-primary",
      message: "Advanced level! Your discipline is an inspiration.",
      shortMessage: `Incredible! ${metadata?.current_streak} days`,
    },
    dangerous: {
      style: "text-red-500",
      message: "Careful! Don't break the cycle now, you're at the top.",
      shortMessage: `Epic streak of ${metadata?.current_streak}!`,
    }
  }

  const date = new Date()
  const startDangerousTime = set(date, { hours: 21, minutes: 0, seconds: 0 })
  const endDangerousTime = set(date, { hours: 23, minutes: 0, seconds: 0 })

  const getLevelKey = (days: number) => {
    if (isWithinInterval(date, { start: startDangerousTime, end: endDangerousTime })) return "dangerous"
    else if (days === 0) return "initial";
    else if (days <= 7) return "constancy";
    else if (days <= 15) return "presidency";
    else if (days <= 30) return "advanced";
    return "dangerous";
  };

  const currentLevel = streakLevelStyles[getLevelKey(metadata?.current_streak ?? 0)];
  const maxLevel = streakLevelStyles[getLevelKey(metadata?.max_streak ?? 0)].style;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenStreakMenu(false)
        setOpenUserMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <header className="m-5 absolute left-0 right-0 flex items-center justify-between">
      <div className="relative">
        <button
          className={`
            flex items-center gap-4 cursor-pointer bg-layer-mid py-2 px-4 rounded
            border border-br-primary ${currentLevel.style} hover:bg-acc-primary
          `}
          onClick={() => setOpenStreakMenu(!openStreakMenu)}
          title={currentLevel.shortMessage}
        >
          <Flame />
          <span className="font-bold">
            {metadata?.current_streak}
          </span>
        </button>
        <StreakMenu
          menuRef={menuRef}
          metadata={metadata}
          openMenu={openStreakMenu}
          weekDays={weekDays}
          style={{
            currentLevel,
            maxLevel
          }}
        />
      </div>
      <div className="relative">
        <button
          className="cursor-pointer"
          title="open user menu"
          onClick={() => setOpenUserMenu(!openStreakMenu)}
        >
          <MenuIcon width={24} />
        </button>
        <UserMenu openMenu={openUserMenu} menuRef={menuRef} />
      </div>
    </header>
  )
}