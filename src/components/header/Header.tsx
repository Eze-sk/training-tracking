import { useEffect, useRef, useState } from "react";
import Flame from "../../assets/Flame";
import { TrainingDay, UserMetadataType } from "../../types/UserMetadata";
import StreakMenu from "./StreaksMenu";
import MenuIcon from "../../assets/Menu";
import UserMenu from "./UserMenu";

export interface Props {
  metadata: UserMetadataType | null
  weekDays: TrainingDay[] | null
}

export default function Header({ metadata, weekDays }: Props) {
  const [openStreakMenu, setOpenStreakMenu] = useState(false)
  const [openUserMenu, setOpenUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

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
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => setOpenStreakMenu(!openStreakMenu)}
        >
          <Flame />
          <span>
            {metadata?.current_streak}
          </span>
        </button>
        <StreakMenu menuRef={menuRef} metadata={metadata} openMenu={openStreakMenu} weekDays={weekDays} />
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