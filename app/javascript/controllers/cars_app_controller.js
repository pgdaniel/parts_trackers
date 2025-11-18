import { Controller } from "@hotwired/stimulus"
import React from 'react'
import { createRoot } from 'react-dom/client'
import CarsApp from '../apps/CarsApp'
import consumer from '../channels/consumer'
import { useCarsStore } from '../stores/carsStore'

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
    this.channel = consumer.subscriptions.create("CarsChannel", {
      connected: () => {
        console.log('Connected to CarsChannel')
        this.render()
      },
      
      disconnected: () => {
        console.log('Disconnected from CarsChannel')
      },
      
      received: (data) => {
        console.log('Received:', data)
        const store = useCarsStore.getState()
        
        switch(data.action) {
          case 'cars_list':
            store.setCars(data.cars)
            break
          case 'car_detail':
            store.setCurrentCar(data.car)
            break
          case 'car_created':
            store.addCar(data.car)
            break
          case 'car_updated':
            store.updateCar(data.car.id, data.car)
            break
          case 'car_deleted':
            store.removeCar(data.id)
            break
          case 'error':
            store.setError(data.message)
            alert(`Error: ${data.message}`)
            break
        }
      }
    })
  }
  
  render() {
    this.root.render(
      <React.StrictMode>
        <CarsApp channel={this.channel} />
      </React.StrictMode>
    )
  }
}
