import { NavLink } from "react-router"
import CalendarRepeatIcon from "../../assets/CalendarRepeat"
import { RefObject } from "react"

export interface Props {
  openMenu: boolean
  menuRef?: RefObject<HTMLDivElement | null>
}

export default function UserMenu({ openMenu, menuRef }: Props) {
  return (
    <>
      {
        openMenu && (
          <div role="dialog" ref={menuRef} className="absolute top-8.75 right-0 z-50 ">
            <img src="./chevron-card.svg" alt="chevron" className="absolute right-1 -top-2" />
            <div
              className="w-62.5 border border-br-primary bg-layer-mid overflow-hidden"
              style={{ borderRadius: "15px 0 15px 15px" }}
            >
              <nav className="flex flex-col gap-3 m-2">
                <NavLink
                  to="/config-training"
                  className="flex gap-2 p-4 hover:bg-acc-primary transition rounded-xl cursor-pointer"
                >
                  <CalendarRepeatIcon />
                  <span>Restart routine</span>
                </NavLink>
              </nav>
            </div>
          </div>
        )
      }
    </>
  )
}