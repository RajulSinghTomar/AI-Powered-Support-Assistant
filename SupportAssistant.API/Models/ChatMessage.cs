namespace SupportAssistant.API.Models;

public class ChatMessage
{
    public int Id { get; set; }

    public string UserMessage { get; set; } = string.Empty;

    public string AIResponse { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int UserId { get; set; }

    public User User { get; set; } = null!;
}