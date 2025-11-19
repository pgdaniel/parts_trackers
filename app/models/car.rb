class Car
  include Mongoid::Document
  include Mongoid::Timestamps
  
  field :make, type: String
  field :model, type: String
  field :year, type: Integer
  field :color, type: String
  field :mileage, type: Integer
  
  # Validations
  validates :make, presence: true
  validates :model, presence: true
  validates :year, presence: true, numericality: { only_integer: true }
  
  # Indexes for better query performance
  index({ make: 1, model: 1 })
  index({ year: 1 })
end
