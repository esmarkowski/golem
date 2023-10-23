module Golems
  class Golem
    include Golems::Identity

    # wget from url and add to knowledge
    def learn
    end

    # ask for feedback from the user
    def ask
    end

    # summarize supplied knowledge
    def summarize(knowledge)
    end

    concerning :Sandbox do
      def write
      end

      def read
      end
    end

    concerning :Memory do
      
      def recall(subject, layer: :short_term)
      end

      def forget(subject, layer: :short_term)
      end

    end

  end
end
