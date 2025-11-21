# frozen_string_literal: true

require 'rails/generators'

class AppSpaGenerator < Rails::Generators::NamedBase
  source_root File.expand_path('templates', __dir__)
  
  argument :attributes, type: :array, default: [], banner: "field:type field:type"
  
  class_option :skip_routes, type: :boolean, default: false, desc: "Skip adding routes to routes.rb"
  class_option :skip_tests, type: :boolean, default: false, desc: "Skip test files"
  
  def create_models
    template "model.rb.tt", "app/models/#{file_name}.rb"
  end
  
  def create_controllers
    template "controller.rb.tt", "app/controllers/#{file_name.pluralize}_controller.rb"
  end
  
  def create_channel
    template "channel.rb.tt", "app/channels/#{file_name.pluralize}_channel.rb"
  end
  
  def create_views
    template "views/index.html.erb.tt", "app/views/#{file_name.pluralize}/index.html.erb"
  end
  
  def create_javascript_app
    template "javascript/app.jsx.tt", "app/javascript/apps/#{class_name}App.jsx"
  end
  
  def create_javascript_components
    template "javascript/components/list.jsx.tt", "app/javascript/components/#{file_name.pluralize}/#{class_name}List.jsx"
    template "javascript/components/detail.jsx.tt", "app/javascript/components/#{file_name.pluralize}/#{class_name}Detail.jsx"
    template "javascript/components/new.jsx.tt", "app/javascript/components/#{file_name.pluralize}/#{class_name}New.jsx"
    template "javascript/components/edit.jsx.tt", "app/javascript/components/#{file_name.pluralize}/#{class_name}Edit.jsx"
    template "javascript/components/form.jsx.tt", "app/javascript/components/#{file_name.pluralize}/#{class_name}Form.jsx"
  end
  
  def create_javascript_infrastructure
    template "javascript/store.js.tt", "app/javascript/stores/#{file_name.pluralize}Store.js"
    template "javascript/channel.js.tt", "app/javascript/channels/#{file_name.pluralize}_channel.js"
    template "javascript/controller.js.tt", "app/javascript/controllers/#{file_name.pluralize}_app_controller.js"
  end
  
  def create_stylesheet
    template "stylesheet.css.tt", "app/assets/stylesheets/#{file_name.pluralize}.css"
  end
  
  def create_tests
    return if options[:skip_tests]
    
    template "test/model_test.rb.tt", "test/models/#{file_name}_test.rb"
    template "test/controller_test.rb.tt", "test/controllers/#{file_name.pluralize}_controller_test.rb"
    template "test/channel_test.rb.tt", "test/channels/#{file_name.pluralize}_channel_test.rb"
  end
  
  def add_routes
    return if options[:skip_routes]
    
    route_code = <<~RUBY
      # #{class_name} SPA - single route, React Router handles internal navigation
        get '#{file_name.pluralize}', to: '#{file_name.pluralize}#index'
        get '#{file_name.pluralize}/*path', to: '#{file_name.pluralize}#index'  # Catch all sub-routes for React Router
      
    RUBY
    
    inject_into_file 'config/routes.rb', route_code, after: "Rails.application.routes.draw do\n"
  end
  
  def register_stimulus_controller
    controller_registration = <<~JS
      
      import #{class_name}AppController from "./#{file_name.pluralize}_app_controller"
      application.register("#{file_name.pluralize}-app", #{class_name}AppController)
    JS
    
    append_to_file 'app/javascript/controllers/index.js', controller_registration
  end
  
  def print_instructions
    say "\n" + "="*80, :green
    say "✅ #{class_name} SPA generated successfully!", :green
    say "="*80, :green
    say "\nNext steps:", :yellow
    say "  1. Start MongoDB if not running: mongod", :cyan
    say "  2. Restart your Rails server: bin/dev", :cyan
    say "  3. Visit: http://localhost:3000/#{file_name.pluralize}", :cyan
    say "\nGenerated files:", :yellow
    say "  📦 Model: #{file_name}.rb", :white
    say "  🎮 Controller: #{file_name.pluralize}_controller.rb", :white
    say "  📡 Channel: #{file_name.pluralize}_channel.rb", :white
    say "  ⚛️  React SPA: #{class_name}App.jsx + 5 components", :white
    say "  🎨 Styles: #{file_name.pluralize}.css", :white
    say "  🧪 Tests: Model, controller, and channel tests", :white unless options[:skip_tests]
    say "\n" + "="*80, :green
  end
  
  private
  
  def parsed_attributes
    attributes.map do |attr|
      # attr is already a Rails::Generators::GeneratedAttribute object
      {
        name: attr.name,
        type: attr.type.to_s.capitalize
      }
    end
  end
end
