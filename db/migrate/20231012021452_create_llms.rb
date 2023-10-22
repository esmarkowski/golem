class CreateLlms < ActiveRecord::Migration[7.1]
  def change
    create_table :llms do |t|
      t.string :provider
      t.string :name
      t.string :api_key
      t.string :api_base

      t.timestamps
    end
  end
end
