import { create } from 'zustand'

export const useToolsStore = create((set) => ({
  tools: [],
  currentTool: null,
  loading: false,
  error: null,

  // Set all tools
  setTools: (tools) => set({ tools, loading: false }),

  // Set current tool being viewed/edited
  setCurrentTool: (tool) => set({ currentTool: tool, loading: false }),

  // Add a new tool to the list
  addTool: (tool) => set((state) => ({
    tools: [...state.tools, tool],
    loading: false
  })),

  // Update a tool in the list and current tool if it matches
  updateTool: (id, updates) => set((state) => ({
    tools: state.tools.map(t => t.id === id ? { ...t, ...updates } : t),
    currentTool: state.currentTool?.id === id ? { ...state.currentTool, ...updates } : state.currentTool,
    loading: false
  })),

  // Remove a tool from the list
  removeTool: (id) => set((state) => ({
    tools: state.tools.filter(t => t.id !== id),
    currentTool: state.currentTool?.id === id ? null : state.currentTool,
    loading: false
  })),

  // Set loading state
  setLoading: (loading) => set({ loading }),

  // Set error state
  setError: (error) => set({ error, loading: false }),

  // Clear error
  clearError: () => set({ error: null })
}))
