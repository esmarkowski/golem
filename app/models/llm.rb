class LLM < ApplicationRecord
    enum :provider, ["OpenAI", "Llama", "StableDiffusion"]
    enum :name, ["gpt-3.5-turbo", "gpt-4"]
end
