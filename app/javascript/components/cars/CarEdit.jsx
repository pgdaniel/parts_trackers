import React, { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCarsStore } from '../../stores/carsStore'
import CarForm from './CarForm'

export default function CarEdit({ channel }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentCar, cars, setCurrentCar } = useCarsStore()

  useEffect(() => {
    // Check if car is already in the cars array
    const car = currentCar?.id === id ? currentCar : cars.find(c => c.id === id)
    
    if (car) {
      setCurrentCar(car)
    } else if (channel) {
      // Only fetch if not found in store
      channel.perform('fetch_car', { id: id })
    }
  }, [id, channel, currentCar, cars, setCurrentCar])

  const handleSubmit = (formData) => {
    if (channel) {
      channel.perform('update_car', { id: id, car: formData })
      navigate(`/${id}`)
    }
  }

  if (!currentCar) {
    return <div className="loading">Loading car...</div>
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Edit Car</h1>
        <Link to={`/${id}`} className="btn btn-secondary">Cancel</Link>
      </div>

      <div className="form-container">
        <CarForm 
          car={currentCar} 
          onSubmit={handleSubmit} 
          onCancel={() => navigate(`/${id}`)} 
        />
      </div>
    </div>
  )
}
