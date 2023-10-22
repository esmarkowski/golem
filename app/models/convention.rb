class Convention < ApplicationRecord

    belongs_to :agent

    delegate :to_prompt, to: :definition

    def definition
        Golems::Convention.find_by_name(self.name)
    end

    def rules
        @rules ||= definition.rules
    end




end
