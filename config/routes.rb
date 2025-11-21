Rails.application.routes.draw do
  resource :session
  resource :registration, only: [ :new, :create ]
  resources :passwords, param: :token

  # Apps Dashboard - manage user-created SPAs
  resources :apps do
    member do
      post :generate
      post :archive
    end
  end

  # Root path
  root "apps#index"

  # Cars SPA - single route, React Router handles internal navigation
  get "cars", to: "cars#index"
  get "cars/*path", to: "cars#index"  # Catch all sub-routes for React Router

  # Tools SPA - single route, React Router handles internal navigation
  get "tools", to: "tools#index"
  get "tools/*path", to: "tools#index"  # Catch all sub-routes for React Router

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  # root "posts#index"
end
