require "test_helper"

class RegistrationsControllerTest < ActionDispatch::IntegrationTest
  test "should get new" do
    get new_registration_url
    assert_response :success
  end

  test "should create user and sign in" do
    assert_difference("User.count", 1) do
      post registration_url, params: { user: {
        email_address: "newuser@example.com",
        password: "password123",
        password_confirmation: "password123"
      } }
    end

    assert_redirected_to after_authentication_url
    assert_not_nil cookies[:session_token]
  end

  test "should not create user with invalid email" do
    assert_no_difference("User.count") do
      post registration_url, params: { user: {
        email_address: "invalid",
        password: "password123",
        password_confirmation: "password123"
      } }
    end

    assert_response :unprocessable_entity
  end

  test "should not create user with short password" do
    assert_no_difference("User.count") do
      post registration_url, params: { user: {
        email_address: "test@example.com",
        password: "short",
        password_confirmation: "short"
      } }
    end

    assert_response :unprocessable_entity
  end

  test "should not create user with mismatched password confirmation" do
    assert_no_difference("User.count") do
      post registration_url, params: { user: {
        email_address: "test@example.com",
        password: "password123",
        password_confirmation: "different123"
      } }
    end

    assert_response :unprocessable_entity
  end
end
