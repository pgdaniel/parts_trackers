import React, { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useToolsStore } from '../../stores/toolsStore'
import ToolForm from './ToolForm'

export default function ToolEdit({ channel }) {
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

  const handleSubmit = (formData) => {
    channel.perform('update_tool', { 
      id: id, 
      tool: formData 
    })
    // Navigation will happen when update is confirmed
    setTimeout(() => navigate(`/${id}`), 500)
  }

  if (loading && !tool) {
    return <div className="loading">Loading tool...</div>
  }

  if (!tool) {
    return <div className="loading">Tool not found</div>
  }

  return (
    <div className="tool-edit-container">
      <div className="tool-edit-nav">
        <Link to={`/${id}`} className="btn btn-secondary">← Cancel</Link>
      </div>

      <h1>Edit Tool</h1>
      <ToolForm 
        initialData={tool} 
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
      />
    </div>
  )
}
