import { createContext, useContext } from 'react'
import { userTrainingService } from '../services/trainingDB'

export interface DbContextType {
  userData: typeof userTrainingService | null
  isLoading: boolean
}

export const DbContext = createContext<DbContextType>({
  userData: null,
  isLoading: true,
})

export const useDb = () => useContext(DbContext)
