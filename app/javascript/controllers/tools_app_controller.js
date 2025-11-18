import { Controller } from "@hotwired/stimulus"
import React from 'react'
import { createRoot } from 'react-dom/client'
import ToolsApp from '../apps/ToolsApp'
import consumer from '../channels/consumer'
import { useToolsStore } from '../stores/toolsStore'

export default class extends Controller {
  connect() {
    this.root = createRoot(this.element)
    this.setupChannel()
  }
  
  disconnect() {
    if (this.channel) {
      this.channel.unsubscribe()
    }
    if (this.root) {
      this.root.unmount()
    }
  }
  
  setupChannel() {
    const store = useToolsStore.getState()
    
    this.channel = consumer.subscriptions.create("ToolsChannel", {
      connected: () => {
        console.log('Connected to ToolsChannel')
        this.render()
      },
      
      disconnected: () => {
        console.log('Disconnected from ToolsChannel')
      },
      
      received: (data) => {
        console.log('Received data:', data)
        
        if (data.action === 'tools_list') {
          store.setTools(data.tools)
        } else if (data.action === 'tool_created') {
          store.addTool(data.tool)
        } else if (data.action === 'tool_updated') {
          store.updateTool(data.tool.id, data.tool)
        } else if (data.action === 'tool_deleted') {
          store.removeTool(data.id)
        } else if (data.action === 'tool_detail') {
          store.setCurrentTool(data.tool)
        } else if (data.action === 'error') {
          store.setError(data.message)
          console.error('Error:', data.message)
        }
      }
    })
  }
  
  render() {
    this.root.render(
      <React.StrictMode>
        <ToolsApp channel={this.channel} />
      </React.StrictMode>
    )
  }
}
