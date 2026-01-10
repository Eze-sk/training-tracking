import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import CreateRoutinePage from './page/CreateRoutine'
import { BrowserRouter, Route, Routes } from 'react-router'
import DatabaseProvider from './context/DatabaseProvider'

// Supports weights 100-900
import '@fontsource-variable/inter'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <DatabaseProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/config-training" element={<CreateRoutinePage />} />
        </Routes>
      </DatabaseProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
