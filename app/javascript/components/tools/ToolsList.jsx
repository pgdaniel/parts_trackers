import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useToolsStore } from '../../stores/toolsStore'

export default function ToolsList({ channel }) {
  const { tools, loading } = useToolsStore()

  useEffect(() => {
    // Fetch tools when component mounts
    if (channel) {
      channel.perform('fetch_tools')
    }
  }, [channel])

  if (loading) {
    return <div className="loading">Loading tools...</div>
  }

  return (
    <div className="tools-list-container">
      <div className="tools-header">
        <h1>🧰 Toolbox</h1>
        <Link to="/new" className="btn btn-primary">
          + Add Tool
        </Link>
      </div>

      {tools.length === 0 ? (
        <div className="empty-state">
          <p>No tools in your toolbox yet.</p>
          <Link to="/new" className="btn btn-primary">Add your first tool</Link>
        </div>
      ) : (
        <div className="tools-grid">
          {tools.map((tool) => (
            <Link key={tool.id} to={`/${tool.id}`} className="tool-card">
              <div className="tool-card-header">
                <h3>{tool.name}</h3>
                <span className={`status-badge status-${tool.status}`}>
                  {tool.status?.replace('_', ' ')}
                </span>
              </div>
              {tool.location && (
                <p className="tool-location">📍 {tool.location}</p>
              )}
              {tool.description && (
                <p className="tool-description">{tool.description}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
