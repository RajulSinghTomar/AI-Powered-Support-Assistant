using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SupportAssistant.API.Data;
using SupportAssistant.API.DTOs;
using SupportAssistant.API.Models;
using System.Security.Claims;
using SupportAssistant.API.Services;

namespace SupportAssistant.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    private readonly GeminiService _geminiService;

    public ChatController(ApplicationDbContext context,GeminiService geminiService)
    {
        _context = context;

        _geminiService = geminiService;
    }

    [HttpPost]
    public async Task<IActionResult> SendMessage(ChatRequestDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (userId == null)
        {
            return Unauthorized();
        }
        //AI response
        var aiResponse = await _geminiService.GenerateResponse(dto.Message);

        var chat = new ChatMessage
        {
            UserMessage = dto.Message,

            AIResponse = aiResponse,

            UserId = int.Parse(userId)
        };

        _context.ChatMessages.Add(chat);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            UserMessage = chat.UserMessage,

            AIResponse = chat.AIResponse
        });
    }
}