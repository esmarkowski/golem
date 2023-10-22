module Golems
    class Message

        attr_accessor :role, :content

        ROLES = [:system, :assistant, :user]

        def initialize(role=:user, content)
            @role = role.to_sym
            @content = content
        end

        ROLES.each do |role|
            define_method("#{role}?") do
                @role == role
            end
        end

    end
end