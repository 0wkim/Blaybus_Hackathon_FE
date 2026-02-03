import { Routes, Route } from 'react-router-dom'
import HomePage from '@/pages/Home/HomePage'
import StudyPage from '@/pages/Study/StudyPage'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/study/:modelId" element={<StudyPage />} />
    </Routes>
  )
}
