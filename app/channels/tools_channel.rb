class ToolsChannel < ApplicationCable::Channel
  def subscribed
    stream_from "tools"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  def fetch_tools
    tools = Tool.all.order(created_at: :desc)
    transmit({
      action: 'tools_list',
      tools: tools.as_json
    })
  end

  def fetch_tool(data)
    tool = Tool.find(data['id'])
    transmit({
      action: 'tool_detail',
      tool: tool.as_json
    })
  rescue ActiveRecord::RecordNotFound
    transmit({
      action: 'error',
      message: 'Tool not found'
    })
  end

  def create_tool(data)
    tool = Tool.create!(data['tool'])
    ActionCable.server.broadcast("tools", {
      action: 'tool_created',
      tool: tool.as_json
    })
  rescue => e
    transmit({
      action: 'error',
      message: e.message
    })
  end

  def update_tool(data)
    tool = Tool.find(data['id'])
    if tool.update(data['tool'])
      ActionCable.server.broadcast("tools", {
        action: 'tool_updated',
        tool: tool.as_json
      })
    else
      transmit({
        action: 'error',
        message: tool.errors.full_messages.join(', ')
      })
    end
  rescue ActiveRecord::RecordNotFound
    transmit({
      action: 'error',
      message: 'Tool not found'
    })
  end

  def delete_tool(data)
    tool = Tool.find(data['id'])
    tool.destroy!
    ActionCable.server.broadcast("tools", {
      action: 'tool_deleted',
      id: data['id']
    })
  rescue ActiveRecord::RecordNotFound
    transmit({
      action: 'error',
      message: 'Tool not found'
    })
  end
end
