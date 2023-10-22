class ChatsController < ApplicationController
    before_action :set_agent, only: %i[ show edit update destroy ]

    def index
        @chats = Chat.all
    end

end