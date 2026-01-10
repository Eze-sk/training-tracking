import './App.css'

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

import { useDb } from './context/DbContext'
import Header from './components/header/Header'
import {
  TrainingDay,
  TrainingLogs,
  UserMetadataType,
} from './types/UserMetadata'
import BtsCheck, { type StatusBts } from './components/BtsCheck'
import CalendarWeeks from './components/CalendarWeeks'
import LoadingAnimation from './components/Loading'
import { DAY } from './consts/Date'
import {
  eachDayOfInterval,
  format,
  getDay,
  isBefore,
  parseISO,
  setDay,
} from 'date-fns'

function App() {
  const { userData, isLoading: isDbLoading } = useDb()
  const [metadata, setMetadata] = useState<UserMetadataType | null>(null)
  const [weekDays, setWeekDays] = useState<TrainingDay[] | null>(null)
  const [checkStatus, setCheckStatus] = useState<StatusBts>('deactivated')
  const [message, setMessage] = useState<string>('')
  const [isVerifying, setIsVerifying] = useState(true)
  const [trainingLogs, setTrainingLogs] = useState<TrainingLogs[]>([])
  const navigate = useNavigate()
  const hasCheckStreak = useRef(false)

  useEffect(() => {
    if (isDbLoading || !userData) return

    let isMounted = true

    const initializeApp = async () => {
      try {
        const hasRoutine = await userData.hasConfiguredRoutine()

        if (!hasRoutine) {
          navigate('/config-training')
          return
        }

        const processedMetadata = await userData.getMetadata()
        const processedDays = await userData.getTrainingDay()
        const processedTrainingLogs = await userData.getTrainigLog()

        const today = new Date().getDay()
        const currentDay = processedDays.find((d) => d.day === today)

        const orderedDays = [...(processedDays ?? [])].sort(
          (a, b) => a.day - b.day,
        )
        const nextDay = orderedDays.find((d) => d.day > today) || orderedDays[0]

        let finalStatus: StatusBts
        let finalMessage = ''

        if (currentDay?.status === 'completed') {
          finalStatus = 'completed'
        } else if (currentDay?.status === 'pending') {
          finalStatus = 'activated'
        } else {
          finalStatus = 'deactivated'
        }

        if (nextDay) {
          finalMessage = `The following routine is on ${DAY[nextDay.day]}.`
        }

        if (isMounted) {
          setMetadata(processedMetadata)
          setWeekDays(processedDays)
          setCheckStatus(finalStatus)
          setMessage(finalMessage)
          setMetadata(processedMetadata)
          setWeekDays(processedDays)
          setTrainingLogs(processedTrainingLogs)
          setIsVerifying(false)
        }
      } catch (err) {
        console.error(`Error initializing data: ${err}`)
      }
    }

    const updateStreak = async () => {
      const processedStartDate = (await userData.getMetadata())
        .routine_start_date
      const startDate = parseISO(processedStartDate.toString())
      const yesterday = setDay(new Date(), 1)

      if (isBefore(yesterday, startDate)) return

      const formatDate = 'yyyy-MM-dd'

      const existingLogsDates = new Set(
        trainingLogs.map((log) =>
          format(parseISO(log.date_recorded), formatDate),
        ),
      )

      const routineDaysIndices = weekDays?.map((d) => d.day)

      const missingDays = eachDayOfInterval({
        start: startDate,
        end: yesterday,
      }).filter((day) => {
        const dateStr = format(day, formatDate)
        const dayOfWeek = getDay(day)

        return (
          routineDaysIndices?.includes(dayOfWeek) &&
          !existingLogsDates.has(dateStr)
        )
      })

      if (missingDays.length > 0) {
        try {
          const updatePromises = missingDays.map((d) =>
            userData.updateTrainingLogs({
              status: 'failed',
              date: format(d, formatDate),
            }),
          )

          await Promise.all(updatePromises)
        } catch (err) {
          console.error(`Error updating streak: ${err}`)
        }
      }
    }

    initializeApp()

    if (!hasCheckStreak.current) {
      updateStreak()
      hasCheckStreak.current = true
    }

    return () => {
      isMounted = false
    }
  }, [isDbLoading, userData, navigate, trainingLogs, weekDays])

  const handleCheckDay = async () => {
    if (checkStatus === 'deactivated' || !weekDays || !userData) return

    const today = new Date().getDay()
    const currentDay = weekDays.find((d) => d.day === today)

    if (!currentDay) return

    const newStatus = currentDay.status === 'pending' ? 'completed' : 'pending'

    try {
      await userData.updateTrainingLogs({ status: newStatus })
      await userData.updateStreak(newStatus === 'completed' ? 1 : -1)

      setMetadata(await userData.getMetadata())

      const updatedWeekDays = weekDays.map((d) => {
        if (d.day === today) {
          return { ...d, status: newStatus }
        }
        return d
      })

      setWeekDays(updatedWeekDays)
      setTrainingLogs(await userData.getTrainigLog())
      setCheckStatus(newStatus === 'completed' ? 'completed' : 'activated')
    } catch (error) {
      console.error('Error updating the database:', error)
    }
  }

  if (isDbLoading || isVerifying) return <LoadingAnimation />

  return (
    <>
      <Header metadata={metadata} weekDays={weekDays} />
      <main className="flex h-screen flex-col items-center justify-center gap-6">
        <BtsCheck event={handleCheckDay} statusBts={checkStatus} />
        <div className="flex flex-col items-center gap-2">
          <CalendarWeeks
            trainingLogs={trainingLogs}
            startDate={metadata?.routine_start_date.toString() ?? ''}
            weekdays={weekDays}
          />
          <span className="text-bold text-ms text-layer-mid italic">
            {message}
          </span>
        </div>
      </main>
    </>
  )
}

export default App
