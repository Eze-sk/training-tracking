import React, { useEffect, useRef, useState } from 'react'
import { useDb } from '../context/DbContext'
import { useNavigate } from 'react-router'
import Spinner from '../components/Spinner'
import {
  CalendarDays,
  CalendarDaysInteractivity,
} from '../components/CalendarDays'

export default function CreateRoutinePage() {
  const [selectedDay, setSelectedDay] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isResetting, setIsResetting] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { userData } = useDb()
  const hasInitialized = useRef(false)

  const navigate = useNavigate()

  useEffect(() => {
    if (!userData || hasInitialized.current) return

    hasInitialized.current = true

    const reset = async () => {
      try {
        setIsResetting(true)
        await userData.resetAllData()
      } catch (err) {
        console.error(`Error initializing data in component: ${err}`)
        setError('Error cleaning up previous data.')
      } finally {
        setIsResetting(false)
      }
    }

    reset()
  }, [userData])

  const toggleDay = (dayIndex: number) => {
    if (selectedDay.includes(dayIndex)) {
      setSelectedDay(selectedDay.filter((d) => d !== dayIndex))
    } else {
      setSelectedDay([...selectedDay, dayIndex])
    }

    setError(null)
  }

  const handleSubmitRoutine = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault()

    if (isResetting) return

    if (selectedDay.length === 0) {
      setError('You must select the days of the routine')
      return
    }

    setIsLoading(true)

    try {
      if (userData) {
        await userData.saveTargetDays({ days: selectedDay })
        await userData.updateRoutineStartDate()

        navigate('/')
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-6xl font-bold">Days to train</h1>
      <section className="bg-layer-mid border-br-primary mt-30 rounded border p-5">
        <CalendarDays>
          {(i) => (
            <CalendarDaysInteractivity
              index={i}
              event={toggleDay}
              selectedDay={selectedDay}
            />
          )}
        </CalendarDays>
      </section>
      <button
        type="submit"
        disabled={isResetting || isLoading}
        className={`bg-layer-top border-br-primary hover:bg-acc-secondary active:bg-acc-primary mt-10 flex min-w-44 items-center justify-center rounded border px-6 py-3 text-xl font-semibold ${isResetting || isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} `}
        onClick={handleSubmitRoutine}
      >
        {isResetting ? (
          <>
            {' '}
            <Spinner className="mr-2" /> Cleaning up...{' '}
          </>
        ) : isLoading ? (
          <Spinner />
        ) : (
          'Start Routine'
        )}
      </button>
      <span className="pointer-events-none mt-5 text-lg font-medium text-red-500 uppercase">
        {error}&#12644;
      </span>
    </main>
  )
}
