class AppsController < ApplicationController
  before_action :require_authentication
  before_action :set_app, only: [:show, :edit, :update, :destroy, :generate, :archive]
  
  def index
    @apps = Current.user.apps.active.order(created_at: :desc)
  end
  
  def show
  end
  
  def new
    @app = Current.user.apps.build
  end
  
  def create
    @app = Current.user.apps.build(app_params)
    
    # Process fields from form
    if params[:fields].present?
      schema_attrs = params[:fields].map do |field|
        { 'name' => field[:name], 'type' => field[:type] }
      end
      @app.schema = schema_attrs.to_json
    end
    
    if @app.save
      begin
        # Generate the SPA files using service
        @app.generate!
        redirect_to apps_path, notice: "App '#{@app.name}' was successfully created and files generated."
      rescue => e
        @app.destroy # Rollback database record if generation fails
        @app.errors.add(:base, "Failed to generate app files: #{e.message}")
        render :new, status: :unprocessable_entity
      end
    else
      render :new, status: :unprocessable_entity
    end
  end
  
  def edit
  end
  
  def update
    if @app.update(app_params)
      redirect_to apps_path, notice: "App was successfully updated."
    else
      render :edit, status: :unprocessable_entity
    end
  end
  
  def destroy
    begin
      # Remove generated files using service
      @app.destroy_generated_files!
      
      # Delete the app record
      @app.destroy!
      redirect_to apps_path, notice: "App was successfully deleted and files removed."
    rescue => e
      redirect_to apps_path, alert: "Failed to delete app: #{e.message}"
    end
  end
  
  def generate
    begin
      @app.regenerate!
      redirect_to apps_path, notice: "App files regenerated successfully."
    rescue => e
      redirect_to apps_path, alert: "Failed to regenerate app: #{e.message}"
    end
  end
  
  def archive
    @app.update(status: 'archived')
    redirect_to apps_path, notice: "App was archived."
  end
  
  private
  
  def set_app
    @app = Current.user.apps.find(params[:id])
  end
  
  def app_params
    params.require(:app).permit(:name, :slug, :description, :status)
  end
end
