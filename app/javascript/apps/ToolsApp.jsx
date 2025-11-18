import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ToolsList from '../components/tools/ToolsList'
import ToolDetail from '../components/tools/ToolDetail'
import ToolEdit from '../components/tools/ToolEdit'
import ToolNew from '../components/tools/ToolNew'

export default function ToolsApp({ channel }) {
  return (
    <BrowserRouter basename="/tools">
      <div className="tools-app">
        <Routes>
          <Route path="/" element={<ToolsList channel={channel} />} />
          <Route path="/new" element={<ToolNew channel={channel} />} />
          <Route path="/:id" element={<ToolDetail channel={channel} />} />
          <Route path="/:id/edit" element={<ToolEdit channel={channel} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
