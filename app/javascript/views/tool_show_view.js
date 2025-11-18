import React from 'react'
import { createRoot } from 'react-dom/client'
import ToolDetail from '../components/ToolDetail'
import consumer from '../channels/consumer'

export class ToolShowApp {
  constructor(element) {
    this.root = createRoot(element)
    this.toolId = element.dataset.toolId
    this.setupChannel()
  }
  
  setupChannel() {
    this.channel = consumer.subscriptions.create(
      { channel: "ToolChannel", id: this.toolId },
      {
        connected: () => {
          console.log('Connected to ToolChannel')
          this.channel.perform('fetch_tool')
        },
        
        disconnected: () => {
          console.log('Disconnected from ToolChannel')
        },
        
        received: (data) => {
          console.log('Received data:', data)
          if (data.tool) {
            this.render(data.tool)
          } else if (data.action === 'tool_updated') {
            this.render(data.tool)
          } else if (data.action === 'error') {
            console.error('Error:', data.errors)
            alert('Error updating tool: ' + data.errors.join(', '))
          }
        }
      }
    )
  }
  
  render(toolData) {
    this.root.render(
      <React.StrictMode>
        <ToolDetail tool={toolData} channel={this.channel} />
      </React.StrictMode>
    )
  }
}
