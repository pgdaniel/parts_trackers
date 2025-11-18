import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function ToolNew({ channel }) {
  const navigate = useNavigate()

  const handleSubmit = (formData) => {
    channel.perform('create_tool', { tool: formData })
    // Navigation will happen when creation is confirmed
    setTimeout(() => navigate('/'), 500)
  }

  return (
    <div className="tool-new-container">
      <div className="tool-new-nav">
        <Link to="/" className="btn btn-secondary">← Cancel</Link>
      </div>

      <h1>Add New Tool</h1>
      <ToolForm 
        onSubmit={handleSubmit}
        submitLabel="Add Tool"
      />
    </div>
  )
}

function ToolForm({ initialData = {}, onSubmit, submitLabel }) {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    status: initialData.status || 'available',
    location: initialData.location || '',
    description: initialData.description || ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="tool-form">
      <div className="form-group">
        <label htmlFor="name">Tool Name *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="e.g., Hammer, Drill, Wrench"
        />
      </div>

      <div className="form-group">
        <label htmlFor="status">Status *</label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
        >
          <option value="available">Available</option>
          <option value="in_use">In Use</option>
          <option value="maintenance">Maintenance</option>
          <option value="retired">Retired</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="location">Location</label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="e.g., Workshop A, Shelf 3, Garage"
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
          placeholder="Any additional details about this tool..."
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

export { ToolForm }
