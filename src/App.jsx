import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './views/Home'
import RoutinePlayer from './views/RoutinePlayer'
import Custom from './views/Custom'
import History from './views/History'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/routine/:id" element={<RoutinePlayer />} />
        <Route path="/custom" element={<Custom />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </BrowserRouter>
  )
}
