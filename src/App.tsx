import "./App.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { useDb } from "./DatabaseContext";
import Header from "./components/header/Header";
import { TrainingDay, TrainingLogs, UserMetadataType } from "./types/UserMetadata";
import BtsCheck, { type StatusBts } from "./components/BtsCheck";
import CalendarWeeks from "./components/CalendarWeeks";
import LoadingAnimation from "./components/Loading";
import { DAY } from "./consts/Date";

function App() {
  const { userData, isLoading: isDbLoading } = useDb()
  const [metadata, setMetadata] = useState<UserMetadataType | null>(null)
  const [weekDays, setWeekDays] = useState<TrainingDay[] | null>(null)
  const [checkStatus, setCheckStatus] = useState<StatusBts>("deactivated")
  const [message, setMessage] = useState<string>("")
  const [isVerifying, setIsVerifying] = useState(true);
  const [trainingLogs, setTrainingLogs] = useState<TrainingLogs[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    if (isDbLoading || !userData) return

    let isMounted = true;

    const initializeApp = async () => {
      try {
        const hasRoutine = await userData.hasConfiguredRoutine()

        if (!hasRoutine) {
          navigate("/config-training");
          return
        }

        const processedMetadata = await userData.getMetadata();
        const processedDays = await userData.getTrainingDay();
        const processedTrainingLogs = await userData.getTrainigLog()

        const today = new Date().getDay()
        const currentDay = processedDays.find(d => d.day === today)

        const orderedDays = [...processedDays ?? []].sort((a, b) => a.day - b.day)
        const nextDay = orderedDays.find(d => d.day > today) || orderedDays[0]

        let finalStatus: StatusBts;
        let finalMessage = "";

        if (currentDay?.status === 'completed') {
          finalStatus = "completed";
        } else if (currentDay?.status === 'deactivated') {
          finalStatus = "deactivated";
        } else {
          finalStatus = "activated";
        }

        if (nextDay) {
          finalMessage = `The following routine is on ${DAY[nextDay.day]}.`
        }

        if (isMounted) {
          setMetadata(processedMetadata);
          setWeekDays(processedDays);
          setCheckStatus(finalStatus);
          setMessage(finalMessage);
          setMetadata(processedMetadata);
          setWeekDays(processedDays);
          setTrainingLogs(processedTrainingLogs)
          setIsVerifying(false);
        }
      } catch (err) {
        console.error(`Error initializing data: ${err}`)
      }
    }

    initializeApp()

    return () => { isMounted = false; };
  }, [isDbLoading, userData, navigate])

  const handleCheckDay = async () => {
    if (checkStatus === "deactivated" || !weekDays || !userData) return

    const today = new Date().getDay()
    const currentDay = weekDays.find(d => d.day === today)

    if (!currentDay) return

    const newStatus = currentDay.status === 'pending' ? 'completed' : 'pending';

    try {
      await userData.updateTrainingLogs({ status: newStatus });
      await userData.updateStreak(newStatus === "completed" ? 1 : -1)

      setMetadata(await userData.getMetadata())

      const updatedWeekDays = weekDays.map((d) => {
        if (d.day === today) {
          return { ...d, status: newStatus };
        }
        return d;
      });

      setWeekDays(updatedWeekDays);
      setTrainingLogs(await userData.getTrainigLog())
      setCheckStatus(newStatus === "completed" ? "completed" : "activated")
    } catch (error) {
      console.error("Error updating the database:", error);
    }
  }

  if (isDbLoading || isVerifying) return <LoadingAnimation />

  return (
    <>
      <Header metadata={metadata} weekDays={weekDays} />
      <main className="flex items-center justify-center flex-col h-screen gap-6">
        <BtsCheck event={handleCheckDay} statusBts={checkStatus} />
        <div className="flex flex-col items-center gap-2">
          <CalendarWeeks
            trainingLogs={trainingLogs}
            startDate={metadata?.routine_start_date.toString() ?? ""}
            weekdays={weekDays}
          />
          <span className="italic text-bold text-ms text-layer-mid">{message}</span>
        </div>
      </main>
    </>
  );
}

export default App;
