class AppGeneratorService
  attr_reader :app
  
  def initialize(app)
    @app = app
  end
  
  # Generate all files for the app
  def generate!
    field_args = build_field_arguments
    command = "bin/rails generate app_spa #{app.slug} #{field_args.join(' ')}"
    
    Rails.logger.info "Generating app: #{command}"
    result = system(command)
    
    unless result
      raise "Failed to generate app files for #{app.slug}"
    end
    
    result
  end
  
  # Destroy all generated files for the app
  def destroy!
    field_args = build_field_arguments
    command = "bin/rails destroy app_spa #{app.slug} #{field_args.join(' ')}"
    
    Rails.logger.info "Destroying app: #{command}"
    result = system(command)
    
    unless result
      Rails.logger.warn "Failed to destroy app files for #{app.slug}"
    end
    
    result
  end
  
  # Regenerate files (useful when templates change)
  def regenerate!
    destroy!
    sleep 0.5 # Give filesystem time to cleanup
    generate!
  end
  
  # Validate that the app can be generated
  def valid_for_generation?
    return false if app.slug.blank?
    return false if app.parsed_schema.empty?
    
    # Check that all fields have valid names and types
    app.parsed_schema.all? do |field|
      field['name'].present? && field['type'].present? &&
        valid_field_type?(field['type'])
    end
  end
  
  # Get the route path for this app
  def route_path
    "/#{app.slug.pluralize}"
  end
  
  # Get the app class name
  def class_name
    app.slug.camelize
  end
  
  # Get the controller name
  def controller_name
    "#{app.slug.pluralize.camelize}Controller"
  end
  
  # Get the channel name
  def channel_name
    "#{app.slug.pluralize.camelize}Channel"
  end
  
  private
  
  def build_field_arguments
    app.parsed_schema.map { |field| "#{field['name']}:#{field['type']}" }
  end
  
  def valid_field_type?(type)
    %w[string integer boolean text decimal float datetime date time].include?(type)
  end
end
