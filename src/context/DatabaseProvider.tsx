import { useEffect, useState } from 'react'
import { userTrainingService } from '../services/trainingDB'
import { DbContext } from './DbContext'

export default function DatabaseProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [service, setService] = useState<typeof userTrainingService | null>(
    null,
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const instance = userTrainingService
      await instance.init()
      setService(instance)
      setLoading(false)
    }

    init()
  }, [])

  return (
    <DbContext.Provider value={{ userData: service, isLoading: loading }}>
      {children}
    </DbContext.Provider>
  )
}
