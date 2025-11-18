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
      action: 'cars_list',
      cars: cars.as_json
    })
  end

  def fetch_car(data)
    car = Car.find(data['id'])
    transmit({
      action: 'car_detail',
      car: car.as_json
    })
  rescue ActiveRecord::RecordNotFound
    transmit({
      action: 'error',
      message: 'Car not found'
    })
  end

  def create_car(data)
    car = Car.create!(data['car'])
    ActionCable.server.broadcast("cars", {
      action: 'car_created',
      car: car.as_json
    })
  rescue => e
    transmit({
      action: 'error',
      message: e.message
    })
  end

  def update_car(data)
    car = Car.find(data['id'])
    if car.update(data['car'])
      ActionCable.server.broadcast("cars", {
        action: 'car_updated',
        car: car.as_json
      })
    else
      transmit({
        action: 'error',
        message: car.errors.full_messages.join(', ')
      })
    end
  rescue ActiveRecord::RecordNotFound
    transmit({
      action: 'error',
      message: 'Car not found'
    })
  end

  def delete_car(data)
    car = Car.find(data['id'])
    car.destroy!
    ActionCable.server.broadcast("cars", {
      action: 'car_deleted',
      id: data['id']
    })
  rescue ActiveRecord::RecordNotFound
    transmit({
      action: 'error',
      message: 'Car not found'
    })
  end
end
