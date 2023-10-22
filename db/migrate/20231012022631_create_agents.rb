class CreateAgents < ActiveRecord::Migration[7.1]
  def change
    create_table :agents do |t|
      t.string :name
      t.text :identity
      t.text :personality
      t.text :responsibilities
      t.text :output

      t.timestamps
    end
  end
end
