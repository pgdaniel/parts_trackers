import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import CarForm from './CarForm'

export default function CarNew({ channel }) {
  const navigate = useNavigate()

  const handleSubmit = (formData) => {
    if (channel) {
      channel.perform('create_car', { car: formData })
      navigate('/')
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Add New Car</h1>
        <Link to="/" className="btn btn-secondary">Cancel</Link>
      </div>

      <div className="form-container">
        <CarForm onSubmit={handleSubmit} onCancel={() => navigate('/')} />
      </div>
    </div>
  )
}
