import CheckIcon from '../assets/Check'
import XIcon from '../assets/XIcon'
import { TrainingDay } from '../types/UserMetadata'
import { DAY } from '../consts/Date'

export interface Props extends Omit<
  React.HTMLAttributes<HTMLTableElement>,
  'children'
> {
  currentDay?: boolean
  children: (index: number) => React.ReactNode
}

export interface PropsChildren {
  index: number
}

export function CalendarDays({ currentDay, children, ...atr }: Props) {
  return (
    <table className="border-separate border-spacing-5 rounded" {...atr}>
      <thead>
        <tr>
          {DAY.map((d, i) => {
            const isToday = i === new Date().getDay()

            const textColor =
              !currentDay || (currentDay && isToday)
                ? 'text-txt-primary'
                : 'text-layer-mid'

            return (
              <th key={d} scope="col" className={`text-center ${textColor}`}>
                {d}.
              </th>
            )
          })}
        </tr>
      </thead>
      <tbody>
        <tr>
          {Array.from({ length: 7 }).map((_, index) => (
            <td key={`day-${index}`} className="text-center">
              {children(index)}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  )
}

export interface PropsInteractivity extends PropsChildren {
  event: (n: number) => void
  selectedDay?: number[]
}

export function CalendarDaysInteractivity({
  event,
  selectedDay,
  index,
}: PropsInteractivity) {
  return (
    <button
      onClick={() => event?.(index)}
      className="bg-layer-top border-br-primary hover:bg-acc-secondary mx-auto flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border"
      style={{
        backgroundColor: selectedDay?.includes(index)
          ? 'var(--color-acc-secondary)'
          : 'var(--color-layer-top)',
      }}
    >
      {selectedDay?.includes(index) ? <XIcon width={50} /> : ''}
    </button>
  )
}

type DayStatus = 'pending' | 'completed' | 'failed' | 'notSelected'

export interface PropsShow extends PropsChildren {
  weekdays: TrainingDay[] | null
}

export function CalendarDaysShow({ weekdays, index }: PropsShow) {
  const dayData = weekdays?.find((d) => d.day === index)

  const style: Record<DayStatus, string> = {
    pending: 'border-br-primary',
    completed: 'border-acc-primary',
    failed: 'border-red-400',
    notSelected: 'border-layer-mid',
  }

  const currentStatus: DayStatus =
    (dayData?.status as DayStatus) ?? 'notSelected'

  return (
    <div
      className={`bg-layer-top relative mx-auto flex h-10 w-10 items-center justify-center rounded-full border ${style[currentStatus]} `}
    >
      {dayData && (
        <>
          {dayData.status === 'failed' && (
            <XIcon className="text-red-500" width={50} />
          )}
          {dayData.status === 'completed' && (
            <CheckIcon width={60} className="text-acc-primary absolute" />
          )}
        </>
      )}
    </div>
  )
}
