using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using Microsoft.EntityFrameworkCore;

using SupportAssistant.API.Data;
using SupportAssistant.API.DTOs;
using SupportAssistant.API.Models;
using SupportAssistant.API.Services;

using System.Security.Claims;

namespace SupportAssistant.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    private readonly GroqService _groqService;

    public ChatController(
        ApplicationDbContext context,
        GroqService groqService)
    {
        _context = context;

        _groqService = groqService;
    }

    [HttpPost]
    public async Task<IActionResult> SendMessage(
        ChatRequestDto dto)
    {
        var userId =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        if (userId == null)
        {
            return Unauthorized();
        }

        // Create new conversation if needed
        Conversation conversation;

        if (dto.ConversationId == null)
        {
            conversation = new Conversation
            {
                Title = dto.Message.Length > 30
                    ? dto.Message.Substring(0, 30)
                    : dto.Message,

                UserId = int.Parse(userId),

                CreatedAt = DateTime.UtcNow
            };

            _context.Conversations.Add(
                conversation);

            await _context.SaveChangesAsync();
        }
        else
        {
            conversation =
                await _context.Conversations
                    .FirstAsync(x =>
                        x.Id ==
                        dto.ConversationId);
        }

        var aiResponse =
            await _groqService.GenerateResponse(
                dto.Message);

        var chatMessage = new ChatMessage
        {
            UserMessage = dto.Message,

            AIResponse = aiResponse,

            UserId = int.Parse(userId),

            ConversationId = conversation.Id,

            CreatedAt = DateTime.UtcNow
        };

        _context.ChatMessages.Add(
            chatMessage);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            conversationId =
                conversation.Id,

            userMessage =
                dto.Message,

            aiResponse =
                aiResponse
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetConversations()
    {
        var userId =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        if (userId == null)
        {
            return Unauthorized();
        }

        var conversations =
            await _context.Conversations
                .Where(x =>
                    x.UserId ==
                    int.Parse(userId))
                .OrderByDescending(x =>
                    x.CreatedAt)
                .ToListAsync();

        return Ok(conversations);
    }

    [HttpGet("{conversationId}")]
    public async Task<IActionResult> GetMessages(
        int conversationId)
    {
        var messages =
            await _context.ChatMessages
                .Where(x =>
                    x.ConversationId ==
                    conversationId)
                .OrderBy(x =>
                    x.CreatedAt)
                .ToListAsync();

        return Ok(messages);
    }
}