# Future TODOs

## Multi-User/Multi-Tenant Architecture

### Goal
Implement user authentication and namespace all apps (tools, cars, etc.) under individual users.

### Architecture Plan
- **SQL (SQLite)**: Store `User` model with authentication (email, password_digest, etc.)
- **MongoDB**: Store user-scoped app data (Tool, Car models) with `user_id` field
- **Pattern**: Option 3 - User Reference Field with Strong Conventions

### Implementation Steps

1. **Add Authentication**
   - Add `bcrypt` gem (uncomment in Gemfile)
   - Create `User` model (ActiveRecord/SQLite)
     - Fields: email, password_digest, name
     - Validations: email uniqueness, presence
   - Add session management or JWT tokens
   - Implement `current_user` helper

2. **Create UserScoped Concern**
   - Create `app/models/concerns/user_scoped.rb`
   - Automatically add `user_id` field to MongoDB models
   - Add validation, indexes, and scoping
   - Set `user_id` from `Current.user` on create

3. **Update Existing Models**
   - Include `UserScoped` in `Tool` model
   - Include `UserScoped` in `Car` model
   - Add compound indexes: `{ user_id: 1, name: 1 }`

4. **Update Channels for Multi-tenancy**
   - Scope all queries by `current_user.id`
   - User-specific streams: `"tools_user_#{current_user.id}"`
   - Ensure `create`/`update` operations include `user_id`
   - Prevent cross-user data access

5. **Update Controllers**
   - Add authentication filters (`before_action :authenticate_user!`)
   - Set `Current.user` for MongoDB model access
   - Redirect unauthenticated users to login

6. **Add Current Context**
   - Create `app/models/current.rb` for thread-safe user storage
   ```ruby
   class Current < ActiveSupport::CurrentAttributes
     attribute :user
   end
   ```

7. **Update SPAs**
   - Add login/signup UI
   - Store auth token/session
   - Pass user context to ActionCable connections
   - Handle unauthorized errors

### Alternative Options Considered

**Option 1: Database-per-User**
- Each user gets own MongoDB database
- Better isolation, easier backups
- More complex connection management

**Option 2: Collection-per-User**
- Dynamic collection names: `user_#{id}_tools`
- Moderate isolation
- Single database, simpler connections

**Option 4: Use mongoid-multitenancy gem**
- Gem-based solution with default scopes
- Automatic tenant filtering
- Additional dependency

### Security Considerations
- Always filter MongoDB queries by `user_id`
- Use concerns/base classes to enforce scoping
- Add integration tests for cross-user access prevention
- Audit logs for data access
- Consider row-level security policies

### Future Enhancements
- Admin role to view all users' data
- Team/organization level above users
- Data export per user
- Usage analytics per user
- Backup/restore individual user data

---

## Dynamic App Routing (Web Deployment)

### Goal
Route URLs to dynamically created user apps on the web, allowing users to access their apps via custom URLs.

### Architecture Options

#### **Option 1: Subdomain Routing** (Recommended for SaaS)
**URL Structure**: `foodtracker.yourdomain.com` → user's food tracker app

```ruby
# config/routes.rb
constraints(subdomain: /.+/) do
  match '*path', to: 'dynamic_apps#route', via: :all
end

# app/controllers/dynamic_apps_controller.rb
class DynamicAppsController < ApplicationController
  def route
    subdomain = request.subdomain
    app = App.find_by(slug: subdomain, status: 'active')
    
    if app
      # Route to the app's controller
      redirect_to "/apps/#{app.slug}#{request.fullpath}"
    else
      render file: 'public/404.html', status: :not_found
    end
  end
end
```

**Requirements**:
- Wildcard DNS (*.yourdomain.com points to your server)
- SSL certificate with wildcard support (Let's Encrypt supports this)
- Nginx/proxy configuration for subdomains
- DNS provider that supports wildcard records

**Pros**:
- Professional looking URLs
- Better app isolation
- Easier to track/analyze per app
- Standard SaaS pattern

**Cons**:
- Requires infrastructure setup
- SSL certificate complexity
- DNS configuration needed

---

#### **Option 2: Path-Based Routing** (Current/Simplest)
**URL Structure**: `yourdomain.com/foodtracker` → user's food tracker app

```ruby
# config/routes.rb
# Dynamic catch-all route (must be at the bottom)
get ':app_slug', to: 'dynamic_apps#show'
get ':app_slug/*path', to: 'dynamic_apps#show'

# app/controllers/dynamic_apps_controller.rb
class DynamicAppsController < ApplicationController
  def show
    @app = App.find_by(slug: params[:app_slug], status: 'active')
    
    if @app
      # Render the app's index view dynamically
      render template: "#{@app.slug.pluralize}/index"
    else
      render file: 'public/404.html', status: :not_found
    end
  end
end
```

**Requirements**:
- Nothing extra needed
- Just database lookup per request
- Works with current setup

**Pros**:
- Zero infrastructure changes
- Works immediately
- Easy to test locally
- Simple deployment

**Cons**:
- URLs less clean (shared domain)
- Harder to brand per app
- Static routes conflict with dynamic routes

---

#### **Option 3: Custom Domain Routing** (Enterprise/White-Label)
**URL Structure**: `myfoodtracker.com` → user's custom branded app

```ruby
# Migration
add_column :apps, :custom_domain, :string
add_index :apps, :custom_domain, unique: true

# config/routes.rb
constraints(CustomDomainConstraint.new) do
  match '*path', to: 'custom_domains#route', via: :all
end

# lib/custom_domain_constraint.rb
class CustomDomainConstraint
  def matches?(request)
    App.exists?(custom_domain: request.host)
  end
end

# app/controllers/custom_domains_controller.rb
class CustomDomainsController < ApplicationController
  def route
    @app = App.find_by!(custom_domain: request.host)
    render template: "#{@app.slug.pluralize}/index"
  end
end
```

**Requirements**:
- Users configure DNS (CNAME to your server)
- SSL certificates per domain (Let's Encrypt with automation)
- Domain verification system (DNS TXT records or file upload)
- Nginx/Caddy with SNI support for multiple SSL certs
- Certificate automation (certbot with DNS challenge or HTTP challenge)

**Pros**:
- Full white-label solution
- Users get their own branded domain
- Professional for enterprise customers
- Can charge premium for this feature

**Cons**:
- Complex infrastructure
- SSL certificate management overhead
- Domain verification flow needed
- DNS propagation delays
- Support burden (users have DNS issues)

---

### Implementation Requirements

#### **1. Database Schema Changes**
```ruby
# Migration
class AddRoutingToApps < ActiveRecord::Migration[8.1]
  def change
    add_column :apps, :routing_type, :string, default: 'path' 
    # Options: 'path', 'subdomain', 'custom_domain'
    
    add_column :apps, :subdomain, :string
    add_column :apps, :custom_domain, :string
    add_column :apps, :domain_verified, :boolean, default: false
    add_column :apps, :ssl_enabled, :boolean, default: false
    
    add_index :apps, :subdomain, unique: true, where: "subdomain IS NOT NULL"
    add_index :apps, :custom_domain, unique: true, where: "custom_domain IS NOT NULL"
  end
end
```

#### **2. Dynamic Controller Loading**
Instead of static controllers, load them dynamically:

```ruby
class DynamicAppsController < ApplicationController
  def show
    @app = find_app_by_route
    
    # Option A: Redirect to generated static route
    redirect_to "/#{@app.slug.pluralize}"
    
    # Option B: Dynamically instantiate controller
    controller_class = "#{@app.slug.pluralize.camelize}Controller".constantize
    controller = controller_class.new
    controller.request = request
    controller.response = response
    controller.process(:index)
  end
  
  private
  
  def find_app_by_route
    case
    when request.subdomain.present? && request.subdomain != 'www'
      App.find_by!(subdomain: request.subdomain, status: 'active')
    when App.exists?(custom_domain: request.host)
      App.find_by!(custom_domain: request.host, status: 'active')
    else
      App.find_by!(slug: params[:app_slug], status: 'active')
    end
  end
end
```

#### **3. Route Management Service**
```ruby
# app/services/app_routing_service.rb
class AppRoutingService
  def initialize(app)
    @app = app
  end
  
  def configure_routing!
    case @app.routing_type
    when 'subdomain'
      validate_subdomain!
      configure_nginx_subdomain
    when 'custom_domain'
      validate_custom_domain!
      issue_ssl_certificate
      configure_nginx_custom_domain
    when 'path'
      # Current behavior - inject routes
      inject_path_routes
    end
  end
  
  private
  
  def validate_subdomain!
    # Check subdomain availability
    # Validate format
  end
  
  def validate_custom_domain!
    # Verify DNS points to our server
    # Check CNAME or A record
  end
  
  def issue_ssl_certificate
    # Use certbot/acme-client to get Let's Encrypt cert
    # Store cert info in database
  end
end
```

#### **4. Asset Compilation Strategy**
```ruby
# Option A: Shared bundle (current approach)
# All apps use same JS/CSS bundle
# Pros: Simple, fast builds
# Cons: Larger initial load

# Option B: Per-app bundles
# config/initializers/assets.rb
Rails.application.config.assets.precompile += Dir[
  Rails.root.join('app/javascript/apps/*App.jsx')
].map { |f| "apps/#{File.basename(f, '.jsx')}.js" }

# Pros: Smaller per-app bundles
# Cons: Longer build times, more complexity
```

#### **5. Caching Strategy**
```ruby
# Cache app lookups to avoid DB hits
class App < ApplicationRecord
  def self.find_by_route(host:, subdomain:, path:)
    Rails.cache.fetch("app_route:#{host}:#{subdomain}:#{path}", expires_in: 5.minutes) do
      # Lookup logic
    end
  end
end
```

#### **6. Multi-Database Per App** (Optional)
```ruby
# Each app gets isolated MongoDB database
class App < ApplicationRecord
  after_create :create_mongo_database
  
  def create_mongo_database
    db_name = "app_#{id}_#{slug}"
    Mongoid::Clients.default.with(database: db_name).command(ping: 1)
    update(mongo_database: db_name)
  end
  
  def with_database
    Mongoid.override_database(mongo_database)
    yield
  ensure
    Mongoid.override_database(nil)
  end
end

# Usage in controller
@app.with_database do
  @items = Item.all
end
```

---

### Recommended Implementation Path

**Phase 1: Current State (✅ Complete)**
- Path-based routing: `yourdomain.com/appslug`
- Static route injection during generation
- Works for single-server development

**Phase 2: Dynamic Path Routing**
- Remove static route injection
- Add catch-all dynamic route
- Database-driven app lookup
- Cache app metadata
- **Benefit**: No code regeneration needed for routing changes

**Phase 3: Subdomain Support**
- Add subdomain field to apps table
- Configure wildcard DNS
- Setup wildcard SSL (Let's Encrypt)
- Add subdomain routing logic
- **Benefit**: Professional URLs, better UX

**Phase 4: Custom Domain Support**
- Add custom_domain field
- DNS verification system
- Per-domain SSL automation (certbot)
- Nginx/Caddy SNI configuration
- Domain management UI
- **Benefit**: White-label, enterprise-ready

**Phase 5: Advanced Features**
- Per-app databases
- Usage analytics/tracking
- App marketplace/discovery
- Custom themes per app
- API access tokens
- Webhooks/integrations

---

### Infrastructure Requirements by Phase

**Phase 2: Dynamic Routing**
- None - works with current setup

**Phase 3: Subdomain Routing**
- DNS: Wildcard A record (*.yourdomain.com → server IP)
- SSL: Single wildcard certificate
- Nginx config:
  ```nginx
  server {
    server_name ~^(?<subdomain>.+)\.yourdomain\.com$;
    # Proxy to Rails app, set subdomain in header
  }
  ```

**Phase 4: Custom Domains**
- DNS: Documentation for users (CNAME setup)
- SSL: Let's Encrypt with certbot automation
- Nginx config: SNI (Server Name Indication) for multiple certs
- Monitoring: Certificate expiry alerts
- Domain verification: DNS TXT record or file upload method
- Caddy alternative: Automatic HTTPS (simpler than Nginx)

---

### Security Considerations

1. **Domain Hijacking Prevention**
   - Verify domain ownership before activation
   - Use DNS TXT records or file upload verification
   - Rate limit domain verification attempts

2. **SSL Certificate Management**
   - Automate renewal (Let's Encrypt renews every 60 days)
   - Monitor expiry dates
   - Fallback to default cert if custom cert fails

3. **Subdomain Squatting**
   - Reserve system subdomains (www, api, admin, etc.)
   - Validate subdomain format/length
   - Consider profanity filters

4. **Performance**
   - Cache DNS/domain lookups heavily
   - Use CDN for static assets
   - Rate limiting per domain

5. **Data Isolation**
   - Ensure user can only access their apps
   - Scope all queries by user_id
   - Audit cross-app access attempts

---

### Tools & Libraries

**DNS Management**:
- `resolv` (Ruby stdlib) for DNS lookups
- `dnsruby` gem for advanced DNS operations

**SSL Automation**:
- `acme-client` gem for Let's Encrypt
- Certbot CLI tool
- Caddy web server (automatic HTTPS)

**Web Server**:
- Nginx with SNI support
- Caddy (simpler, auto-HTTPS)
- Traefik (container-friendly)

**Monitoring**:
- SSL certificate expiry monitoring
- Domain resolution checks
- Uptime monitoring per subdomain

---

### Current Implementation Gap

Right now the system:
- ✅ Generates static files per app
- ✅ Injects static routes into routes.rb
- ✅ Each app is a separate set of files
- ✅ Works great for development/single-tenant

To support dynamic routing:
1. **Skip route injection** during generation (or make it optional)
2. **Add dynamic catch-all route** that looks up apps in DB
3. **Cache app lookups** to avoid DB hits on every request
4. **Handle authentication** per app (app-specific sessions or global)
5. **Consider lazy loading** controllers/components on demand

---

### Code Examples

#### Dynamic App Lookup with Caching
```ruby
# app/models/app.rb
class App < ApplicationRecord
  def self.route_to(request)
    cache_key = "app_routing:#{request.host}:#{request.subdomain}:#{request.path}"
    
    Rails.cache.fetch(cache_key, expires_in: 5.minutes) do
      case
      when request.subdomain.present? && request.subdomain != 'www'
        find_by(subdomain: request.subdomain, status: 'active')
      when exists?(custom_domain: request.host)
        find_by(custom_domain: request.host, status: 'active')
      else
        # Extract slug from path
        slug = request.path.split('/')[1]
        find_by(slug: slug, status: 'active')
      end
    end
  end
end
```

#### Nginx Configuration for Subdomains
```nginx
# /etc/nginx/sites-available/yourapp

# Main domain
server {
  listen 443 ssl http2;
  server_name yourdomain.com;
  
  ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
  
  location / {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}

# Wildcard subdomain
server {
  listen 443 ssl http2;
  server_name ~^(?<subdomain>.+)\.yourdomain\.com$;
  
  ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
  
  location / {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Subdomain $subdomain;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

#### Certbot Command for Wildcard SSL
```bash
# Get wildcard certificate
sudo certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials ~/.secrets/cloudflare.ini \
  -d yourdomain.com \
  -d '*.yourdomain.com'

# Or manual DNS challenge
sudo certbot certonly \
  --manual \
  --preferred-challenges dns \
  -d yourdomain.com \
  -d '*.yourdomain.com'
```

---

### Testing Strategy

1. **Local Development**
   - Use `/etc/hosts` for subdomain testing
   - Self-signed SSL for testing
   ```
   127.0.0.1 test.myapp.local
   127.0.0.1 app1.myapp.local
   ```

2. **Staging Environment**
   - Real DNS with staging subdomain
   - Let's Encrypt staging environment
   - Test DNS propagation delays

3. **Integration Tests**
   ```ruby
   # test/integration/dynamic_routing_test.rb
   class DynamicRoutingTest < ActionDispatch::IntegrationTest
     test "routes to app via subdomain" do
       app = create(:app, subdomain: 'test-app')
       host! 'test-app.example.com'
       get '/'
       assert_response :success
     end
     
     test "routes to app via custom domain" do
       app = create(:app, custom_domain: 'myapp.com')
       host! 'myapp.com'
       get '/'
       assert_response :success
     end
   end
   ```
