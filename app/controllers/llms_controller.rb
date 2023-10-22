class LlmsController < ApplicationController
  before_action :set_llm, only: %i[ show edit update destroy ]

  # GET /llms or /llms.json
  def index
    @llms = LLM.all
  end

  # GET /llms/1 or /llms/1.json
  def show
  end

  # GET /llms/new
  def new
    @llm = LLM.new
  end

  # GET /llms/1/edit
  def edit
  end

  # POST /llms or /llms.json
  def create
    @llm = LLM.new(llm_params)

    respond_to do |format|
      if @llm.save
        format.html { redirect_to llm_url(@llm), notice: "LLM was successfully created." }
        format.json { render :show, status: :created, location: @llm }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @llm.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /llms/1 or /llms/1.json
  def update
    respond_to do |format|
      if @llm.update(llm_params)
        format.html { redirect_to llm_url(@llm), notice: "LLM was successfully updated." }
        format.json { render :show, status: :ok, location: @llm }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @llm.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /llms/1 or /llms/1.json
  def destroy
    @llm.destroy!

    respond_to do |format|
      format.html { redirect_to llms_url, notice: "LLM was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_llm
      @llm = LLM.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def llm_params
      params.fetch(:llm, {})
    end
end
