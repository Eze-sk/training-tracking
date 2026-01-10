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
      const instance = userTrainingService;
      try {
        await instance.init();
        setService(instance);
        setLoading(false);
      } catch (e) {
        console.error("Falla en el inicio de DB", e);
      }
    };
    init();
  }, []);

  return (
    <DbContext.Provider value={{ userData: service, isLoading: loading }}>
      {children}
    </DbContext.Provider>
  )
}
