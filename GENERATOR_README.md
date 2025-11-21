# App SPA Generator - Quick Start

## Generate Your First App

```bash
# Simple inventory tracker
bin/rails generate app_spa inventory name:string quantity:integer location:string

# Product catalog
bin/rails generate app_spa product name:string sku:string price:integer stock:integer description:string category:string

# Task manager
bin/rails generate app_spa task title:string description:string status:string priority:string due_date:string

# Contact manager
bin/rails generate app_spa contact name:string email:string phone:string company:string notes:string
```

## What You Get

Each command generates a **complete, production-ready SPA** with:

- ✅ MongoDB backend with proper indexes
- ✅ Separate user authentication system
- ✅ Real-time ActionCable data sync
- ✅ React SPA with routing (List, Detail, Edit, Create)
- ✅ Zustand state management
- ✅ Responsive UI with purple gradient theme
- ✅ Full CRUD operations
- ✅ Form validation
- ✅ Test suite

## After Generation

1. Restart server: `bin/dev`
2. Visit: `http://localhost:3000/inventories` (or your app name)
3. Sign up: `http://localhost:3000/inventory/registration/new`
4. Start using your app!

## Multi-App Architecture

Generate multiple apps - each with isolated users:

```bash
bin/rails generate app_spa tools name:string status:string location:string
bin/rails generate app_spa parts name:string part_number:string quantity:integer
bin/rails generate app_spa equipment name:string serial:string location:string
```

Users created for "tools" cannot access "parts" or "equipment" - complete isolation!

## Admin Access

SQL-based admin users (from main authentication) can optionally access all apps by:

1. Modifying the authentication concern
2. Adding admin check in controllers
3. Bypassing app-specific auth for admin role

## Need Help?

See full documentation: `lib/generators/app_spa/USAGE`
