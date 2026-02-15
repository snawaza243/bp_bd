using WebApplication1.Services; 

var builder = WebApplication.CreateBuilder(args);

// Register services
builder.Services.AddScoped<JiomartXPathCrawler>();

// Add other services here if needed
// builder.Services.AddScoped<CommonService>();
// builder.Services.AddScoped<DataService>();

// Add services to the container.
builder.Services.AddControllers();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
