using System.Text;
using System.Text.Json;

namespace SupportAssistant.API.Services;

public class GroqService
{
    private readonly IConfiguration _configuration;

    private readonly HttpClient _httpClient;

    public GroqService(
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
            _configuration["Groq:ApiKey"];

        var url =
            "https://api.groq.com/openai/v1/chat/completions";

        var requestBody = new
        {
            model = "llama-3.3-70b-versatile",

            messages = new[]
            {
                new
                {
                    role = "user",
                    content = prompt
                }
            }
        };

        var json =
            JsonSerializer.Serialize(requestBody);

        var request =
            new HttpRequestMessage(
                HttpMethod.Post,
                url);

        request.Headers.Add(
            "Authorization",
            $"Bearer {apiKey}");

        request.Content =
            new StringContent(
                json,
                Encoding.UTF8,
                "application/json");

        var response =
            await _httpClient.SendAsync(request);

        var responseContent =
            await response.Content.ReadAsStringAsync();

        Console.WriteLine(responseContent);

        response.EnsureSuccessStatusCode();

        using var document =
            JsonDocument.Parse(responseContent);

        return document
            .RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString()!;
    }
}