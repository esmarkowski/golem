module Golems
    class Convention

        class_attribute :conventions, instance_accessor: false 

        attr_accessor :name, :rules

        def initialize(convention)
            @name = convention.first
            @rules = convention.last
        end

        def to_prompt
            @rules.map { |d| "- #{d}" }.join("\n")
        end
        
        def self.conventions
            self.load #if @conventions.blank?
            @conventions
        end

        def id
            self.name.parameterize.underscore
        end

        def self.names
            self.conventions.map(&:name)
        end

        def self.find_by_name(name)
            self.conventions.find { |c| c.name == name }
        end

        # Load all files from the conventions directory
        def self.load
            @conventions = []
            Dir["#{Rails.root}/lib/golems/conventions/*.yml"].each do |file|
                YAML.load_file(file).each do |convention|
                    @conventions << self.new(convention)
                end
            end
        end

    end
end
