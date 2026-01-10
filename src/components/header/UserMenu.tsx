import { NavLink } from 'react-router'
import CalendarRepeatIcon from '../../assets/CalendarRepeat'
import { RefObject } from 'react'

export interface Props {
  openMenu: boolean
  menuRef?: RefObject<HTMLDivElement | null>
}

export default function UserMenu({ openMenu, menuRef }: Props) {
  return (
    <>
      {openMenu && (
        <div
          role="dialog"
          ref={menuRef}
          className="absolute top-8.75 right-0 z-50"
        >
          <img
            src="./chevron-card.svg"
            alt="chevron"
            className="absolute -top-2 right-1"
          />
          <div
            className="border-br-primary bg-layer-mid w-62.5 overflow-hidden border"
            style={{ borderRadius: '15px 0 15px 15px' }}
          >
            <nav className="m-2 flex flex-col gap-3">
              <NavLink
                to="/config-training"
                className="hover:bg-acc-primary flex cursor-pointer gap-2 rounded-xl p-4 transition"
              >
                <CalendarRepeatIcon />
                <span>Restart routine</span>
              </NavLink>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
