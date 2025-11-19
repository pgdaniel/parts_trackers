import React, { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useToolsStore } from '../../stores/toolsStore'

export default function ToolDetail({ channel }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { tools, currentTool, loading } = useToolsStore()

  // Try to find the tool in the list first, or use currentTool
  const tool = currentTool?.id === id 
    ? currentTool 
    : tools.find(t => t.id === id)

  useEffect(() => {
    // If we don't have the tool in our store, fetch it
    if (channel && id && !tool) {
      channel.perform('fetch_tool', { id: id })
    }
  }, [channel, id, tool])

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this tool?')) {
      channel.perform('delete_tool', { id: id })
      navigate('/')
    }
  }

  if (loading && !tool) {
    return <div className="loading">Loading tool...</div>
  }

  if (!tool) {
    return <div className="loading">Tool not found</div>
  }

  return (
    <div className="tool-detail-container">
      <div className="tool-detail-nav">
        <Link to="/" className="btn btn-secondary">← Back to Toolbox</Link>
      </div>

      <div className="tool-detail">
        <div className="tool-header">
          <div>
            <h1>{tool.name}</h1>
            <span className={`status-badge status-${tool.status}`}>
              {tool.status?.replace('_', ' ')}
            </span>
          </div>
          <div className="tool-actions">
            <Link to={`/${id}/edit`} className="btn btn-primary">
              Edit
            </Link>
            <button onClick={handleDelete} className="btn btn-danger">
              Delete
            </button>
          </div>
        </div>

        <div className="tool-info">
          {tool.location && (
            <div className="info-row">
              <strong>Location:</strong>
              <span>📍 {tool.location}</span>
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
    </div>
  )
}
