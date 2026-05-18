using Microsoft.EntityFrameworkCore;
using SupportAssistant.API.Models;

namespace SupportAssistant.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
}