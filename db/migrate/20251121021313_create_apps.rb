class CreateApps < ActiveRecord::Migration[8.1]
  def change
    create_table :apps do |t|
      t.references :user, null: false, foreign_key: true
      t.string :name, null: false
      t.string :slug, null: false
      t.text :description
      t.text :schema # JSON string of field definitions
      t.string :status, default: 'active' # active, archived

      t.timestamps
    end

    add_index :apps, :slug, unique: true
    add_index :apps, [ :user_id, :slug ], unique: true
  end
end
