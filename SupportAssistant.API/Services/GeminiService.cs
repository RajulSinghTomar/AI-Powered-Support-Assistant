using System.Text;
using System.Text.Json;

namespace SupportAssistant.API.Services;

public class GeminiService
{
    private readonly IConfiguration _configuration;

    private readonly HttpClient _httpClient;

    public GeminiService(
        IConfiguration configuration,
        HttpClient httpClient)
    {
        _configuration = configuration;

        _httpClient = httpClient;
    }
    public async Task<string> GenerateResponse(
    string prompt)
{
    var apiKey =
        _configuration["Gemini:ApiKey"];

    var url =
    $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={apiKey}";

    var requestBody = new
    {
        contents = new[]
        {
            new
            {
                parts = new[]
                {
                    new
                    {
                        text = prompt
                    }
                }
            }
        }
    };

    var json =
        JsonSerializer.Serialize(requestBody);

    var content =
        new StringContent(
            json,
            Encoding.UTF8,
            "application/json");

    var response =
        await _httpClient.PostAsync(
            url,
            content);

    var responseContent =
        await response.Content.ReadAsStringAsync();

    Console.WriteLine(responseContent);

    //response.EnsureSuccessStatusCode();
    if (!response.IsSuccessStatusCode)
{
    return "AI service is temporarily unavailable.";
}

    using var document =
        JsonDocument.Parse(responseContent);

    return document
        .RootElement
        .GetProperty("candidates")[0]
        .GetProperty("content")
        .GetProperty("parts")[0]
        .GetProperty("text")
        .GetString()!;
}
}