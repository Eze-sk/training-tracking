import { DAY } from "../consts/Date"
import { TrainingDay } from "../types/UserMetadata"

export function getCurrentDay(days: TrainingDay[] | null): { status: boolean, message: string } {
  const today = new Date().getDay()

  const isCurrentDay = days?.find(d => d.day === today)

  if (isCurrentDay) {
    return {
      status: false,
      message: "Check Day"
    }
  }

  const orderedDays = [...days ?? []].sort((a, b) => a.day - b.day)
  const nextDay = orderedDays.find(d => d.day > today) || orderedDays[0]

  return {
    status: true,
    message: `The following routine is on ${DAY[nextDay.day]}.`
  }
}