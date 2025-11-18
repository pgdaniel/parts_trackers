class CreateTools < ActiveRecord::Migration[8.1]
  def change
    create_table :tools do |t|
      t.string :name
      t.string :size
      t.text :description

      t.timestamps
    end
  end
end
