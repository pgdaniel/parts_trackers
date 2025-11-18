import React from 'react'
import { Link } from 'react-router-dom'

export default function CarForm({ car, onSubmit, onCancel }) {
  const [formData, setFormData] = React.useState({
    make: car?.make || '',
    model: car?.model || '',
    year: car?.year || new Date().getFullYear(),
    color: car?.color || '',
    mileage: car?.mileage || 0
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'mileage' ? parseInt(value) || 0 : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <label htmlFor="make">Make</label>
        <input
          type="text"
          id="make"
          name="make"
          value={formData.make}
          onChange={handleChange}
          required
          placeholder="Toyota, Honda, Ford..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="model">Model</label>
        <input
          type="text"
          id="model"
          name="model"
          value={formData.model}
          onChange={handleChange}
          required
          placeholder="Camry, Civic, F-150..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="year">Year</label>
        <input
          type="number"
          id="year"
          name="year"
          value={formData.year}
          onChange={handleChange}
          required
          min="1900"
          max={new Date().getFullYear() + 1}
        />
      </div>

      <div className="form-group">
        <label htmlFor="color">Color</label>
        <input
          type="text"
          id="color"
          name="color"
          value={formData.color}
          onChange={handleChange}
          required
          placeholder="Red, Blue, Black..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="mileage">Mileage</label>
        <input
          type="number"
          id="mileage"
          name="mileage"
          value={formData.mileage}
          onChange={handleChange}
          required
          min="0"
          placeholder="50000"
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {car ? 'Update Car' : 'Add Car'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
