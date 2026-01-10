import ChevronRightIcon from '../assets/ChevronRight'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import {
  format,
  startOfWeek,
  addDays,
  startOfMonth,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  isAfter,
  getDay,
} from 'date-fns'
import {
  EventMap,
  Status,
  TrainingDay,
  TrainingLogs,
} from '../types/UserMetadata'
import XIcon from '../assets/XIcon'
import CheckIcon from '../assets/Check'

const STATUS_COLORS_DAY: Record<Status | 'default', string> = {
  completed: 'border-acc-primary text-acc-primary',
  failed: 'border-red-400 text-red-400',
  default: 'border-layer-mid border-layer-mid text-layer-mid',
  pending: 'text-txt-secondary border-background',
}

export interface Props {
  trainingLogs: TrainingLogs[]
  startDate: string
  weekdays: TrainingDay[] | null
}

export default function CalendarWeeks({
  trainingLogs,
  startDate,
  weekdays,
}: Props) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

  const nextMonth = useCallback(() => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }, [currentMonth])

  const prevMonth = useCallback(() => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }, [currentMonth])

  useEffect(() => {
    const event = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevMonth()
      if (e.key === 'ArrowRight') nextMonth()
    }

    document.addEventListener('keydown', event)

    return () => {
      document.removeEventListener('keydown', event)
    }
  }, [nextMonth, prevMonth])

  const dayWeekNumber = useMemo(() => {
    return (weekdays || []).map((d) => d.day)
  }, [weekdays])

  const eventByDate = useMemo(() => {
    const map: EventMap = {}

    if (!Array.isArray(trainingLogs)) return map

    trainingLogs.map((e) => {
      const dateKey = format(parseISO(e.date_recorded), 'yyyy-MM-dd')

      if (!map[dateKey]) {
        map[dateKey] = []
      }

      map[dateKey].push(e)
    })

    return map
  }, [trainingLogs])

  const renderDays = () => {
    const dataForm = 'EE'
    const days = []

    const startDate = startOfWeek(currentMonth, { weekStartsOn: 0 })

    for (let i = 0; i < 7; i++) {
      days.push(
        <span className="font-bold" key={i}>
          {format(addDays(startDate, i), dataForm)}.
        </span>,
      )
    }

    return <>{days}</>
  }

  const isRecurringDay = useCallback(
    (dayToCheck: Date) => {
      const startObj = parseISO(startDate)

      const isValidDate =
        isAfter(dayToCheck, startObj) || isSameDay(dayToCheck, startObj)

      const dayOfWeek = getDay(dayToCheck)
      const isCorrectDay = dayWeekNumber?.includes(dayOfWeek)

      return isValidDate && isCorrectDay
    },
    [startDate, dayWeekNumber],
  )

  const renderCells = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 })

    const dateFormat = 'd'
    const days: React.ReactNode[] = []
    let day: Date = startDate

    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 7; c++) {
        const currentDay = day

        const formattedDateKey = format(currentDay, 'yyyy-MM-dd')
        const formattedDate = format(currentDay, dateFormat)

        const dayEvents = eventByDate[formattedDateKey] || []
        const mainStatus = dayEvents.length > 0 ? dayEvents[0].status : null

        const isToday = isSameDay(currentDay, new Date())
        const isCurrentMonth = isSameMonth(currentDay, monthStart)

        let statusClass

        if (
          isRecurringDay(currentDay) &&
          isCurrentMonth &&
          !isToday &&
          !mainStatus
        ) {
          statusClass = STATUS_COLORS_DAY.pending
        } else if (mainStatus) {
          statusClass = STATUS_COLORS_DAY[mainStatus]
        } else {
          statusClass = STATUS_COLORS_DAY.default
        }

        days.push(
          <div
            className={`relative flex aspect-square h-5 w-5 items-center justify-center rounded border p-7 ${!isToday && statusClass} ${!isCurrentMonth ? 'bg-layer-mid' : ''} ${isToday && !mainStatus ? 'border-br-primary' : ''} `}
            key={day.toString()}
          >
            <div className="z-10">
              {mainStatus === 'completed' && (
                <CheckIcon width={80} className="text-acc-primary" />
              )}
              {mainStatus === 'failed' && (
                <XIcon width={80} className="text-red-500" />
              )}
            </div>
            <span
              className={`absolute right-1 bottom-1 text-xs font-bold ${isToday ? 'text-txt-primary' : ''} ${!isCurrentMonth ? 'text-layer-top' : ''} `}
            >
              {formattedDate}
            </span>
          </div>,
        )

        day = addDays(day, 1)
      }
    }

    return <>{days}</>
  }, [currentMonth, eventByDate, isRecurringDay])

  return (
    <section className="bg-layer-mid border-br-primary rounded-2xl border p-4">
      <header className="mb-4 flex items-center gap-4">
        <div className="bg-layer-top border-br-primary overflow-hidden rounded border">
          <button
            className="hover:bg-acc-secondary active:bg-acc-primary cursor-pointer p-2"
            onClick={prevMonth}
          >
            <ChevronRightIcon width={30} />
          </button>
          <button
            className="hover:bg-acc-secondary active:bg-acc-primary cursor-pointer p-2"
            onClick={nextMonth}
          >
            <ChevronRightIcon width={30} className="rotate-180" />
          </button>
        </div>
        <div className="bg-layer-top border-br-primary flex items-center gap-2 rounded border px-6 py-2">
          <h2 className="text-2xl font-bold">{format(currentMonth, 'MMMM')}</h2>
          <span className="text-txt-secondary font-medium">
            {format(currentMonth, 'y')}
          </span>
        </div>
      </header>
      <section className="bg-layer-top border-br-primary grid grid-cols-7 gap-3 rounded border p-3 text-center">
        {renderDays()}
        {renderCells}
      </section>
    </section>
  )
}
