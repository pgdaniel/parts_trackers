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
