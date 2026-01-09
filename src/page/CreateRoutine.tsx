import React, { useState } from "react"
import { useDb } from "../DatabaseContext"
import { useNavigate } from "react-router"
import Spinner from "../components/Spinner"
import { CalendarDays, CalendarDaysInteractivity } from "../components/CalendarDays"

export default function CreateRoutinePage() {
  const [selectedDay, setSelectedDay] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { userData } = useDb()

  const navigate = useNavigate()

  const toggleDay = (dayIndex: number) => {
    if (selectedDay.includes(dayIndex)) {
      setSelectedDay(selectedDay.filter(d => d !== dayIndex))
    } else {
      setSelectedDay([...selectedDay, dayIndex])
    }

    setError(null)
  }

  const handleSubmitRoutine = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    if (selectedDay.length === 0) {
      setError("You must select the days of the routine")
      return
    }

    setIsLoading(true)

    try {
      if (userData) {
        await userData.saveTargetDays({ days: selectedDay })
        await userData.updateRoutineStartDate()

        navigate("/")
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex items-center justify-center flex-col h-screen">
      <h1 className="text-6xl font-bold">Days to train</h1>
      <section className="bg-layer-mid p-5 rounded mt-30 border border-br-primary">
        <CalendarDays>
          {(i) => (
            <CalendarDaysInteractivity index={i} event={toggleDay} selectedDay={selectedDay} />
          )}
        </CalendarDays>
      </section>
      <button
        type="submit"
        className="
          bg-layer-top border border-br-primary hover:bg-acc-secondary active:bg-acc-primary
          text-xl font-semibold py-3 px-6 rounded cursor-pointer mt-10 min-w-44 flex items-center 
          justify-center
          "
        onClick={handleSubmitRoutine}
      >
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            Start Routine
          </>
        )}
      </button>
      <span className="text-red-500 font-medium text-lg uppercase mt-5 pointer-events-none">{error}&#12644;</span>
    </main>
  )
}