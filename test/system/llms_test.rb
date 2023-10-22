require "application_system_test_case"

class LLMsTest < ApplicationSystemTestCase
  setup do
    @llm = llms(:one)
  end

  test "visiting the index" do
    visit llms_url
    assert_selector "h1", text: "LLMs"
  end

  test "should create llm" do
    visit llms_url
    click_on "New llm"

    click_on "Create LLM"

    assert_text "LLM was successfully created"
    click_on "Back"
  end

  test "should update LLM" do
    visit llm_url(@llm)
    click_on "Edit this llm", match: :first

    click_on "Update LLM"

    assert_text "LLM was successfully updated"
    click_on "Back"
  end

  test "should destroy LLM" do
    visit llm_url(@llm)
    click_on "Destroy this llm", match: :first

    assert_text "LLM was successfully destroyed"
  end
end
