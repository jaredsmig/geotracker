var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy.WithOrigins("http://localhost:3000")
                        .AllowAnyHeader()
                        .AllowAnyMethod());
});

var port = Environment.GetEnvironmentVariable("PORT") ?? "80";
builder.WebHost.UseUrls($"http://*:{port}");
var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();
app.MapOpenApi();

// Use CORS policy
app.UseCors("AllowFrontend");

app.UseHttpsRedirection();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

// Simple GeoJSON track endpoint for ArcGIS overlay
app.MapGet("/tracks.geojson", () =>
{
    // Demo track: randomize each coordinate slightly within SF viewport
    double minLon = -122.425, maxLon = -122.395;
    double minLat = 37.770, maxLat = 37.790;
    var baseCoordinates = new double[][]
    {
        new [] { -122.4194, 37.7749 },
        new [] { -122.414,  37.7785 },
        new [] { -122.409,  37.7810 },
        new [] { -122.404,  37.7835 },
        new [] { -122.399,  37.7860 }
    };
    var rand = new Random();
    var coordinates = baseCoordinates.Select(coord => new double[] {
        Math.Min(maxLon, Math.Max(minLon, coord[0] + (rand.NextDouble() - 0.5) * 0.004)),
        Math.Min(maxLat, Math.Max(minLat, coord[1] + (rand.NextDouble() - 0.5) * 0.004))
    }).ToArray();
    var current = coordinates[^1];

    var featureCollection = new
    {
        type = "FeatureCollection",
        features = new object[]
        {
            new // LineString track
            {
                type = "Feature",
                properties = new { id = "asset-123", kind = "track" },
                geometry = new
                {
                    type = "LineString",
                    coordinates = coordinates
                }
            },
            new // Point for current position
            {
                type = "Feature",
                properties = new { id = "asset-123", kind = "current" },
                geometry = new
                {
                    type = "Point",
                    coordinates = current
                }
            }
        }
    };

    return Results.Json(featureCollection, statusCode: 200, contentType: "application/geo+json");
})
.WithName("GetTrackGeoJSON");

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
