import ChevronRightIcon from "../assets/ChevronRight"
import React, { useEffect, useMemo, useState } from "react"

import {
  format, startOfWeek, addDays, startOfMonth, isSameMonth, isSameDay, addMonths, subMonths,
  parseISO,
  isAfter,
  getDay,
} from 'date-fns';
import { EventMap, Status, TrainingDay, TrainingLogs } from "../types/UserMetadata";
import XIcon from "../assets/XIcon";
import CheckIcon from "../assets/Check";

const STATUS_COLORS_DAY: Record<Status | "default", string> = {
  completed: "border-acc-primary text-acc-primary",
  failed: "border-red-400 text-red-400",
  default: "border-layer-mid border-layer-mid text-layer-mid",
  pending: "text-txt-secondary border-background"
}

export interface Props {
  trainingLogs: TrainingLogs[]
  startDate: string
  weekdays: TrainingDay[] | null
}

export default function CalendarWeeks({ trainingLogs, startDate, weekdays }: Props) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [weekDays, setWeekdays] = useState<number[]>([])

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  useEffect(() => {
    const event = (e: any) => {
      if (e.key === "ArrowLeft") prevMonth()
      if (e.key === "ArrowRight") nextMonth()
    }

    document.addEventListener("keydown", event)

    return () => {
      document.removeEventListener("keydown", event)
    }
  }, [nextMonth, prevMonth])

  const isRecurringDay = (dayToCheck: Date) => {
    const startObj = parseISO(startDate)

    const isValidDate = isAfter(dayToCheck, startObj) || isSameDay(dayToCheck, startObj)

    const dayOfWeek = getDay(dayToCheck)
    const isCorrectDay = weekDays?.includes(dayOfWeek)

    return isValidDate && isCorrectDay
  }

  useEffect(() => {
    setWeekdays((weekdays || []).map(d => d.day))
  }, [weekdays])

  const eventByDate = useMemo(() => {
    const map: EventMap = {}

    if (!Array.isArray(trainingLogs)) return map;

    trainingLogs.map(e => {
      const dateKey = format(parseISO(e.date_recorded), "yyyy-MM-dd")

      if (!map[dateKey]) {
        map[dateKey] = []
      }

      map[dateKey].push(e)
    })

    return map
  }, [trainingLogs])

  const renderDays = () => {
    const dataForm = "EE"
    const days = []

    let startDate = startOfWeek(currentMonth, { weekStartsOn: 0 });

    for (let i = 0; i < 7; i++) {
      days.push(
        <span className="font-bold" key={i}>
          {
            format(addDays(startDate, i), dataForm)
          }.
        </span>
      )
    }

    return <>{days}</>
  }

  const renderCells = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 })

    const dateFormat = "d"
    let days: React.ReactNode[] = []
    let day: Date = startDate

    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 7; c++) {
        const currentDay = day

        const formattedDateKey = format(currentDay, "yyyy-MM-dd")
        const formattedDate = format(currentDay, dateFormat)

        const dayEvents = eventByDate[formattedDateKey] || []
        const mainStatus = dayEvents.length > 0 ? dayEvents[0].status : null;

        const isToday = isSameDay(currentDay, new Date());
        const isCurrentMonth = isSameMonth(currentDay, monthStart);

        let statusClass

        if (isRecurringDay(currentDay) && isCurrentMonth && !isToday && !mainStatus) {
          statusClass = STATUS_COLORS_DAY.pending
        } else if (mainStatus) {
          statusClass = STATUS_COLORS_DAY[mainStatus]
        } else {
          statusClass = STATUS_COLORS_DAY.default
        }

        days.push(
          <div
            className={`
              w-5 h-5 border rounded aspect-square p-7 relative flex items-center justify-center
              ${!isToday && statusClass}
              ${!isCurrentMonth ? "bg-layer-mid" : ""}
              ${isToday && !mainStatus ? "border-br-primary" : ""}
            `}
            key={day.toString()}
          >
            <div className="z-10">
              {mainStatus === "completed" && <CheckIcon width={80} className="text-acc-primary" />}
              {mainStatus === "failed" && <XIcon width={80} className="text-red-500" />}
            </div>
            <span className={`
              text-xs absolute bottom-1 right-1 font-bold
              ${isToday ? "text-txt-primary" : ""}
              ${!isCurrentMonth ? "text-layer-top" : ""}
              `
            }>
              {formattedDate}
            </span>
          </div>
        )

        day = addDays(day, 1)
      }
    }

    return <>{days}</>
  }, [currentMonth, eventByDate, isRecurringDay])

  return (
    <section className="bg-layer-mid rounded-2xl border border-br-primary p-4">
      <header className="flex gap-4 mb-4 items-center">
        <div className="rounded bg-layer-top overflow-hidden border border-br-primary">
          <button
            className="cursor-pointer hover:bg-acc-secondary active:bg-acc-primary p-2"
            onClick={prevMonth}
          >
            <ChevronRightIcon width={30} />
          </button>
          <button
            className="cursor-pointer hover:bg-acc-secondary active:bg-acc-primary p-2"
            onClick={nextMonth}
          >
            <ChevronRightIcon width={30} className="rotate-180" />
          </button>
        </div>
        <div className="flex gap-2 rounded px-6 py-2 bg-layer-top border border-br-primary items-center">
          <h2 className="text-2xl font-bold">{format(currentMonth, "MMMM")}</h2>
          <span className="font-medium text-txt-secondary">{format(currentMonth, "y")}</span>
        </div>
      </header>
      <section className="grid grid-cols-7 gap-3 text-center bg-layer-top border border-br-primary p-3 rounded">
        {renderDays()}
        {renderCells}
      </section>
    </section>
  )
}