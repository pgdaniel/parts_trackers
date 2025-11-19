import React, { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useCarsStore } from '../../stores/carsStore'

export default function CarDetail({ channel }) {
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

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this car?')) {
      channel.perform('delete_car', { id: id })
      navigate('/')
    }
  }

  if (!currentCar) {
    return <div className="loading">Loading car...</div>
  }

  return (
    <div className="container">
      <div className="header">
        <Link to="/" className="btn btn-secondary">← Back to Garage</Link>
        <div className="btn-group">
          <Link to={`/${id}/edit`} className="btn btn-primary">Edit</Link>
          <button onClick={handleDelete} className="btn btn-danger">Delete</button>
        </div>
      </div>

      <div className="detail-card">
        <h1>{currentCar.year} {currentCar.make} {currentCar.model}</h1>
        <div className="detail-grid">
          <div className="detail-item">
            <strong>Make:</strong>
            <span>{currentCar.make}</span>
          </div>
          <div className="detail-item">
            <strong>Model:</strong>
            <span>{currentCar.model}</span>
          </div>
          <div className="detail-item">
            <strong>Year:</strong>
            <span>{currentCar.year}</span>
          </div>
          <div className="detail-item">
            <strong>Color:</strong>
            <span>{currentCar.color}</span>
          </div>
          <div className="detail-item">
            <strong>Mileage:</strong>
            <span>{currentCar.mileage?.toLocaleString()} miles</span>
          </div>
        </div>
      </div>
    </div>
  )
}
