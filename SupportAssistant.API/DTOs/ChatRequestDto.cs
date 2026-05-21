namespace SupportAssistant.API.DTOs;

public class ChatRequestDto
{
    public string Message { get; set; } = string.Empty;
    public int? ConversationId { get; set; }
}