import React, { useState, useEffect } from 'react'

export default function ToolDetail({ tool: initialTool, channel }) {
  const [tool, setTool] = useState(initialTool)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    setTool(initialTool)
  }, [initialTool])

  const handleEdit = () => {
    setFormData({
      name: tool.name,
      status: tool.status,
      description: tool.description,
      location: tool.location
    })
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({})
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    channel.perform('update_tool', { tool: formData })
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="tool-detail">
        <h1>Edit Tool</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status:</label>
            <select
              id="status"
              name="status"
              value={formData.status || ''}
              onChange={handleChange}
            >
              <option value="">Select status</option>
              <option value="available">Available</option>
              <option value="in_use">In Use</option>
              <option value="maintenance">Maintenance</option>
              <option value="retired">Retired</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location:</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location || ''}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="tool-detail">
      <div className="tool-header">
        <h1>{tool.name}</h1>
        <button className="btn btn-primary" onClick={handleEdit}>
          Edit
        </button>
      </div>

      <div className="tool-info">
        <div className="info-row">
          <strong>Status:</strong>
          <span className={`status-badge status-${tool.status}`}>
            {tool.status}
          </span>
        </div>

        {tool.location && (
          <div className="info-row">
            <strong>Location:</strong>
            <span>{tool.location}</span>
          </div>
        )}

        {tool.description && (
          <div className="info-row">
            <strong>Description:</strong>
            <p>{tool.description}</p>
          </div>
        )}

        <div className="info-row">
          <strong>Created:</strong>
          <span>{new Date(tool.created_at).toLocaleDateString()}</span>
        </div>

        <div className="info-row">
          <strong>Last Updated:</strong>
          <span>{new Date(tool.updated_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  )
}
