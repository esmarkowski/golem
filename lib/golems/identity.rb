require 'active_support/concern'

module Golems
  module Identity
    extend ActiveSupport::Concern

    included do
      class_attribute :identity, instance_accessor: true
    end

    class_methods do
      def behavior(prompt)
        self.identity = prompt
      end
    end

  end
end
