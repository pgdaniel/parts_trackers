import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import CarsList from '../components/cars/CarsList'
import CarDetail from '../components/cars/CarDetail'
import CarEdit from '../components/cars/CarEdit'
import CarNew from '../components/cars/CarNew'

export default function CarsApp({ channel }) {
  return (
    <BrowserRouter basename="/cars">
      <Routes>
        <Route path="/" element={<CarsList channel={channel} />} />
        <Route path="/new" element={<CarNew channel={channel} />} />
        <Route path="/:id" element={<CarDetail channel={channel} />} />
        <Route path="/:id/edit" element={<CarEdit channel={channel} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
