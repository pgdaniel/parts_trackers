import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCarsStore } from '../../stores/carsStore'

export default function CarsList({ channel }) {
  const { cars, loading } = useCarsStore()

  useEffect(() => {
    if (channel) {
      channel.perform('fetch_cars')
    }
  }, [channel])

  if (loading) {
    return <div className="loading">Loading cars...</div>
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🚗 Car Garage</h1>
        <Link to="/new" className="btn btn-primary">Add New Car</Link>
      </div>

      {cars.length === 0 ? (
        <div className="empty-state">
          <p>No cars in the garage yet.</p>
          <Link to="/new" className="btn btn-primary">Add Your First Car</Link>
        </div>
      ) : (
        <div className="grid">
          {cars.map((car) => (
            <Link key={car.id} to={`/${car.id}`} className="card">
              <h3>{car.year} {car.make} {car.model}</h3>
              <div className="car-details">
                <p><strong>Color:</strong> {car.color}</p>
                <p><strong>Mileage:</strong> {car.mileage?.toLocaleString()} miles</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
