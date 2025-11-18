import { Controller } from "@hotwired/stimulus"
import React from 'react'
import { createRoot } from 'react-dom/client'
import ToolDetail from '../components/ToolDetail'
import consumer from '../channels/consumer'

export default class extends Controller {
  static values = { id: String }
  
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
    this.channel = consumer.subscriptions.create(
      { channel: "ToolChannel", id: this.idValue },
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
