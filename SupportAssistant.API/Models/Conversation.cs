namespace SupportAssistant.API.Models;

public class Conversation
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public int UserId { get; set; }

    public User User { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public List<ChatMessage> Messages { get; set; }
        = new();
}