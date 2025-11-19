# Load Mongoid configuration for hybrid SQL/MongoDB setup
Mongoid.load!(Rails.root.join("config", "mongoid.yml"), :environment)

# Optional: Configure Mongoid logger to use Rails logger
Mongoid.logger = Rails.logger
Mongo::Logger.logger = Rails.logger

# Ensure ActiveRecord is the default ORM for generators
Rails.application.config.generators do |g|
  g.orm :active_record
end
