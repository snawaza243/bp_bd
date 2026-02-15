using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(CWM.Startup))]
namespace CWM
{
    public partial class Startup {
        public void Configuration(IAppBuilder app) {
            ConfigureAuth(app);
        }
    }
}
