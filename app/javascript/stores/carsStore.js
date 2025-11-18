import { create } from 'zustand'

export const useCarsStore = create((set) => ({
  cars: [],
  currentCar: null,
  loading: false,
  error: null,

  setCars: (cars) => set({ cars, loading: false }),
  
  setCurrentCar: (car) => set({ currentCar: car, loading: false }),
  
  addCar: (car) => set((state) => ({ 
    cars: [car, ...state.cars],
    loading: false 
  })),
  
  updateCar: (id, updates) => set((state) => ({
    cars: state.cars.map(c => c.id === id ? { ...c, ...updates } : c),
    currentCar: state.currentCar?.id === id ? { ...state.currentCar, ...updates } : state.currentCar,
    loading: false
  })),
  
  removeCar: (id) => set((state) => ({
    cars: state.cars.filter(c => c.id !== id),
    currentCar: state.currentCar?.id === id ? null : state.currentCar,
    loading: false
  })),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error, loading: false })
}))
