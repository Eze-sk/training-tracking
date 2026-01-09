import { RefObject } from "react";
import Flame from "../../assets/Flame";
import { CalendarDays, CalendarDaysShow } from "../CalendarDays";
import { TrainingDay, UserMetadataType } from "../../types/UserMetadata";

export interface Props {
  openMenu: boolean;
  menuRef: RefObject<HTMLDivElement | null>
  metadata: UserMetadataType | null
  weekDays: TrainingDay[] | null
}

export default function StreakMenu({ openMenu, menuRef, metadata, weekDays }: Props) {
  return (
    <>
      {openMenu && (
        <div
          role="dialog"
          ref={menuRef}
          className="absolute top-8.75 border border-br-primary bg-layer-mid p-4 z-50"
          style={{ borderRadius: "0 15px 15px 15px" }}
        >
          <img src="./chevron-card.svg" alt="chevron" className="absolute -top-2.5 left-1" />
          <div className="flex gap-2 mb-5 items-center justify-center">
            <div>
              <h2 className="text-3xl font-bold">{metadata?.current_streak} day streak</h2>
              <h3 className="text-xl font-medium text-txt-secondary mt-1">Your longest streak {metadata?.max_streak}</h3>
              <p className="text-lg mt-3 max-w-[24ch] text-pretty">Complete the routine and start your new streak</p>
            </div>
            <Flame width={150} />
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