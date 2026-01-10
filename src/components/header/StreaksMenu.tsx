import { RefObject } from "react";
import Flame from "../../assets/Flame";
import { CalendarDays, CalendarDaysShow } from "../CalendarDays";
import { TrainingDay, UserMetadataType } from "../../types/UserMetadata";
import { StreakLevelType } from "./Header";

export interface Props {
  openMenu: boolean;
  menuRef: RefObject<HTMLDivElement | null>
  metadata: UserMetadataType | null
  weekDays: TrainingDay[] | null
  style?: {
    currentLevel: StreakLevelType,
    maxLevel: string
  }
}

export default function StreakMenu({ openMenu, menuRef, metadata, weekDays, style }: Props) {
  let currentLevel: StreakLevelType
  let maxLevel: string

  if (style) {
    currentLevel = style.currentLevel
    maxLevel = style.maxLevel
  } else {
    currentLevel = {
      style: "text-txt-secondary",
      message: "Complete the routine and start your new streak",
    }

    maxLevel = "text-txt-secondary"
  }

  return (
    <>
      {openMenu && (
        <div
          role="dialog"
          ref={menuRef}
          className="absolute top-15 border border-br-primary bg-layer-mid p-4 z-50"
          style={{ borderRadius: "0 15px 15px 15px" }}
        >
          <img src="./chevron-card.svg" alt="chevron" className="absolute -top-2.5 left-1" />
          <div className="flex gap-2 mb-5 items-center justify-center">
            <div>
              <h2 className={`text-3xl font-bold ${currentLevel.style}`}>{metadata?.current_streak} day streak</h2>
              <h3 className={`text-xl font-medium mt-1 ${maxLevel}`}>Your longest streak {metadata?.max_streak}</h3>
              <p className="text-lg mt-3 max-w-[24ch] text-pretty">{currentLevel.message}</p>
            </div>
            <Flame width={150} className={`${currentLevel.style}`} />
          </div>
          <div className="bg-layer-top border border-br-primary rounded">
            <CalendarDays
              currentDay
            >
              {(i) => (
                <CalendarDaysShow index={i} weekdays={weekDays} />
              )}
            </CalendarDays>
          </div>
        </div>
      )}
    </>
  )
}