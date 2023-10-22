require "test_helper"

class LlmsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @llm = llms(:one)
  end

  test "should get index" do
    get llms_url
    assert_response :success
  end

  test "should get new" do
    get new_llm_url
    assert_response :success
  end

  test "should create llm" do
    assert_difference("LLM.count") do
      post llms_url, params: { llm: {  } }
    end

    assert_redirected_to llm_url(LLM.last)
  end

  test "should show llm" do
    get llm_url(@llm)
    assert_response :success
  end

  test "should get edit" do
    get edit_llm_url(@llm)
    assert_response :success
  end

  test "should update llm" do
    patch llm_url(@llm), params: { llm: {  } }
    assert_redirected_to llm_url(@llm)
  end

  test "should destroy llm" do
    assert_difference("LLM.count", -1) do
      delete llm_url(@llm)
    end

    assert_redirected_to llms_url
  end
end
