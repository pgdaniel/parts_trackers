# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# Sample Cars
Car.find_or_create_by!(make: "Toyota", model: "Camry") do |car|
  car.year = 2020
  car.color = "Silver"
  car.mileage = 35000
end

Car.find_or_create_by!(make: "Honda", model: "Civic") do |car|
  car.year = 2019
  car.color = "Blue"
  car.mileage = 42000
end

Car.find_or_create_by!(make: "Ford", model: "F-150") do |car|
  car.year = 2021
  car.color = "Black"
  car.mileage = 28000
end

# Sample Tool (if not already created)
Tool.find_or_create_by!(name: "Hammer") do |tool|
  tool.description = "Standard claw hammer"
end
