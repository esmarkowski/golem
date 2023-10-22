class Agent < ApplicationRecord
  # belongs_to :llm, optional: true
  has_many :conventions

  accepts_nested_attributes_for :conventions, allow_destroy: true

  attr_accessor :task, :responses

  def initialize(*args)
    super(*args)
    @responses = []
  end


  def chat(task, role: :assistant)
    @task = task
  
    @responses ||= []

    logger.info "#PROMPT to #{name}: #{task}"

    @responses << llm_client.chat(
      parameters: {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: role,
            content: to_s
          }
        ],
      }
    )

    logger.info "#{name}: #{last_response}}"


    <<~RESPONSE
      #{last_response.dig("choices", 0, "message", "content")}
      
      #{Rainbow(costs.map {|k,v| "#{k}: $#{v}"}.join("\t")).dimgray}
    RESPONSE
  end

  def to_s
    <<~PROMPT
        #{identity}

        TASK: #{task}

        CONVENTIONS: 
        #{conventions.map(&:to_prompt).join("\n")}
    PROMPT
  end

  concerning :Responses do
    
    def strip_code_fence(response)
      response.gsub(/```.*$/, "")
    end

    def unsafe_eval(response)
      eval(strip_code_fence(response))
    end

    def last_response
      @responses.last
    end

    def follow_conventions?(response=nil)
      response = response.blank? ? last_response.dig("choices", 0, "message", "content") : response
      validation_prompt = <<~PROMPT
        You are a Code Reviewer. You ensure the Engineer's code follows conventions. Does this response follow the conventions? Carefully consider the conventions below and ensure it follows the conventions.
        Respond with LGTM, in all caps if it follows conventions.
        Otherwise, respond with NEEDS REVIEW, in all caps if it does not follow conventions and provide a solution
      
        RESPONSE:
        #{response}

        CONVENTIONS:
        #{conventions.map(&:to_prompt).join("\n")}

      PROMPT

      self.chat(validation_prompt)
      (last_response.dig("choices", 0, "message", "content") =~ /YES/).present?
    end

    def costs
      input_per_1k = 0.012 / 1000
      output_per_1k = 0.016 / 1000

      tokens = responses.map { |d| d["usage"]}.inject{|memo, el| memo.merge( el ){|k, old_v, new_v| old_v + new_v}} 
      prompt = tokens.dig("prompt_tokens").to_i * input_per_1k 
      completion = tokens.dig("completion_tokens").to_i * output_per_1k
      { prompt: prompt, completion: completion, total: prompt + completion}
    end

  end

  protected

  def logger
    @logger ||= Logger.new("#{Rails.root}/log/#{name.downcase.parameterize.underscore}.log")
  end

  def llm_client
    # Pull configuration and initialize client depending on llm provider
    @client ||= OpenAI::Client.new
  end
end
