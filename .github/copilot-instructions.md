# Copilot Instructions for Parts Tracker

## Architecture Overview

This is a **Rails 8.1** application using the modern Rails stack with SQLite for all storage needs (database, cache, job queue, and Action Cable). The project uses a **unique hybrid architecture**: each view renders its own SPA with **ActionCable for real-time data transfer**.

Key architectural decisions:
- **View-scoped SPAs**: Each view (e.g., inventory, orders) is an independent single-page application
- **ActionCable for data**: Use WebSocket channels instead of REST/JSON APIs for all client-server communication
- **Solid Queue** for background jobs (runs in-process with Puma via `SOLID_QUEUE_IN_PUMA=true`)
- **Solid Cache** and **Solid Cable** for performance and real-time features (Solid Cable backs ActionCable)
- **Propshaft** for asset pipeline (not Sprockets)
- **esbuild** for JavaScript bundling (via jsbundling-rails)
- **SQLite multi-database setup**: separate databases for primary, cache, queue, and cable in production
- **Kamal** deployment configured for containerized deployment

## Development Workflows

### Starting the Application
```bash
bin/dev  # Runs Procfile.dev: Rails server + esbuild watch mode
```
This starts two processes: the Rails server with Ruby debugger enabled and JavaScript building in watch mode.

### Setup/Reset
```bash
bin/setup              # Initial setup: bundle, yarn, db:prepare
bin/setup --reset      # Full reset: drops and recreates database
```

### Running Tests
```bash
bin/rails test         # Run all tests (parallelized by default)
bin/rails test:system  # System tests with Selenium/Chrome headless
bin/ci                 # Full CI suite: tests + linting + security audits
```

### Code Quality & Security
```bash
bin/rubocop           # Ruby style (follows Rails Omakase styling)
bin/brakeman          # Security vulnerability scanner
bin/bundler-audit     # Check for vulnerable gem versions
```

## JavaScript/Frontend Conventions

Each view is a **self-contained SPA** that manages its own state and UI. While Hotwire (Turbo + Stimulus) is available, prefer building view-specific JavaScript applications that communicate via ActionCable.

### Structure
- **View-specific SPAs** in `app/javascript/views/` (e.g., `inventory_view.js`, `orders_view.js`)
- **Shared components** in `app/javascript/components/`
- **ActionCable channels** in `app/javascript/channels/` for real-time data
- Entry point: `app/javascript/application.js`
- Build output: `app/assets/builds/application.js` (generated, don't edit)

### ActionCable Data Pattern
Instead of REST APIs or Turbo Streams, use ActionCable channels for all data operations:

```javascript
// Example: app/javascript/channels/inventory_channel.js
import consumer from "./consumer"

consumer.subscriptions.create("InventoryChannel", {
  received(data) {
    // Update SPA state with received data
    this.updateInventoryState(data)
  },
  
  requestItems() {
    this.perform('fetch_items')
  },
  
  createItem(itemData) {
    this.perform('create_item', itemData)
  }
})
```

### Rails Channel Pattern
Corresponding server-side channel handles data operations:

```ruby
# app/channels/inventory_channel.rb
class InventoryChannel < ApplicationCable::Channel
  def subscribed
    stream_from "inventory_#{current_user.id}"
  end
  
  def fetch_items
    items = InventoryItem.all
    transmit(items: items.as_json)
  end
  
  def create_item(data)
    item = InventoryItem.create!(data['item'])
    ActionCable.server.broadcast("inventory_#{current_user.id}", 
      action: 'item_created', item: item.as_json)
  end
end
```

### View Loading Pattern
Each Rails view initializes its corresponding SPA:

```erb
<%# app/views/inventory/index.html.erb %>
<div id="inventory-app" data-user-id="<%= current_user.id %>"></div>

<script type="module">
  import { InventoryApp } from '/assets/views/inventory_view.js'
  new InventoryApp(document.getElementById('inventory-app'))
</script>
```

**Note**: Stimulus controllers are still available for simple interactions, but **prefer view-scoped SPAs with ActionCable** for complex, stateful features. Turbo can be used for navigation between different views/SPAs.

## Background Jobs

Jobs inherit from `ApplicationJob` and are processed by Solid Queue. In development/single-server setups, jobs run inside the Puma process. For production scaling, disable `SOLID_QUEUE_IN_PUMA` and run dedicated job workers.

Recurring jobs are configured in `config/recurring.yml` (see `clear_solid_queue_finished_jobs` example).

## Database Patterns

- Uses SQLite with **separate database files** for different concerns in production
- Migrations live in `db/migrate/` (primary), `db/cache_migrate/`, `db/queue_migrate/`, `db/cable_migrate/`
- Schema files: `db/schema.rb`, `db/cache_schema.rb`, `db/queue_schema.rb`, `db/cable_schema.rb`
- Connection pooling configured per database in `config/database.yml`

## Deployment

Uses **Kamal** for zero-downtime Docker deployments:
```bash
bin/kamal deploy       # Deploy to servers in config/deploy.yml
bin/kamal app exec     # Run commands in deployed container
```

Configuration in `config/deploy.yml`:
- Server IPs defined under `servers.web`
- Registry at `localhost:5555` (update for your registry)
- `RAILS_MASTER_KEY` required for secrets (stored in `.kamal/secrets`)

## Testing Conventions

- Tests parallelize automatically (`parallelize(workers: :number_of_processors)`)
- System tests support **remote Selenium** for CI (see `CAPYBARA_SERVER_PORT` and `SELENIUM_HOST` env vars in `application_system_test_case.rb`)
- Fixtures in `test/fixtures/` are loaded for all tests
- CI validates: tests, style (RuboCop), security (Brakeman, bundler-audit), and seed data integrity

## Project-Specific Notes

- Application name: **Parts Trakcer** (note the typo in module name `PartsTrakcer` in `config/application.rb`)
- PWA support configured but disabled by default (see commented routes in `config/routes.rb` and manifest links in `application.html.erb`)
- Health check endpoint: `/up` for load balancers/monitoring
- No root route defined yet—add controllers/views as needed
