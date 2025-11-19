class Tool
  include Mongoid::Document
  include Mongoid::Timestamps
  
  field :name, type: String
  field :size, type: String
  field :description, type: String
  
  # Validations
  validates :name, presence: true
  
  # Indexes for better query performance
  index({ name: 1 })
end
