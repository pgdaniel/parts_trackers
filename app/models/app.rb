class App < ApplicationRecord
  belongs_to :user
  
  # Validations
  validates :name, presence: true
  validates :slug, presence: true, uniqueness: { scope: :user_id }, 
            format: { with: /\A[a-z][a-z0-9_]*\z/, message: "must start with a letter and contain only lowercase letters, numbers, and underscores" }
  validates :status, inclusion: { in: %w[active archived] }
  
  # Callbacks
  before_validation :generate_slug, on: :create
  
  # Scopes
  scope :active, -> { where(status: 'active') }
  scope :archived, -> { where(status: 'archived') }
  
  # Schema handling
  def parsed_schema
    schema.present? ? JSON.parse(schema) : []
  rescue JSON::ParserError
    []
  end
  
  def schema_attributes=(attrs)
    self.schema = attrs.to_json
  end
  
  # Service object for generation
  def generator
    @generator ||= AppGeneratorService.new(self)
  end
  
  # Generate files for this app
  def generate!
    generator.generate!
  end
  
  # Remove generated files for this app
  def destroy_generated_files!
    generator.destroy!
  end
  
  # Regenerate files (useful when templates change)
  def regenerate!
    generator.regenerate!
  end
  
  # Get the route path
  def route_path
    generator.route_path
  end
  
  private
  
  def generate_slug
    self.slug = name.parameterize.underscore if name.present? && slug.blank?
  end
end
