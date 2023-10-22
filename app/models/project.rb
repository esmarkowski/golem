class Project < ApplicationRecord

    def available_agents
        Agent.all
    end
end
