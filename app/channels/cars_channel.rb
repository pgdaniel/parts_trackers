class CarsChannel < ApplicationCable::Channel
  def subscribed
    stream_from "cars"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  def fetch_cars
    cars = Car.all.order(created_at: :desc)
    transmit({
      action: "cars_list",
      cars: cars.map { |c| serialize_car(c) }
    })
  end

  def fetch_car(data)
    car = Car.find(data["id"])
    transmit({
      action: "car_detail",
      car: serialize_car(car)
    })
  rescue Mongoid::Errors::DocumentNotFound
    transmit({
      action: "error",
      message: "Car not found"
    })
  end

  def create_car(data)
    car = Car.create!(data["car"])
    ActionCable.server.broadcast("cars", {
      action: "car_created",
      car: serialize_car(car)
    })
  rescue => e
    transmit({
      action: "error",
      message: e.message
    })
  end

  def update_car(data)
    car = Car.find(data["id"])
    if car.update(data["car"])
      ActionCable.server.broadcast("cars", {
        action: "car_updated",
        car: serialize_car(car)
      })
    else
      transmit({
        action: "error",
        message: car.errors.full_messages.join(", ")
      })
    end
  rescue Mongoid::Errors::DocumentNotFound
    transmit({
      action: "error",
      message: "Car not found"
    })
  end

  def delete_car(data)
    car = Car.find(data["id"])
    car.destroy!
    ActionCable.server.broadcast("cars", {
      action: "car_deleted",
      id: data["id"]
    })
  rescue Mongoid::Errors::DocumentNotFound
    transmit({
      action: "error",
      message: "Car not found"
    })
  end

  private

  def serialize_car(car)
    car.as_json.merge("id" => car.id.to_s).except("_id")
  end
end
