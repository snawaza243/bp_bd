using HtmlAgilityPack;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium;

namespace JioMartScraping.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class JioMartController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetJioMartData([FromQuery] string url)
        {
            var res = ScrapeProductDetails(url);

            return new ContentResult()
            {
                Content = res,
                ContentType = "application/json",
            };
        }

        private string ScrapeProductDetails(string url)
        {
            ProductsDetails productsDetails = new ProductsDetails();

            var options = new ChromeOptions();
            options.AddArgument("headless");
            using (IWebDriver driver = new ChromeDriver(options))
            {
                driver.Navigate().GoToUrl(url);

                System.Threading.Thread.Sleep(5000);

                try
                {
                    var price = driver.FindElement(By.CssSelector("span.jm-heading-xs.jm-ml-xxs"));
                    productsDetails.ProductPrice = price?.Text.Trim() ?? null;
                }
                catch (Exception)
                {
                    productsDetails.ProductPrice = null;
                }

                try
                {
                    var emiStart = driver.FindElement(By.CssSelector("span.jm-body-s-bold.jm-fc-light-black.jm-pl-xs"));
                    productsDetails.EMIStart = emiStart?.Text.Trim() ?? null;
                }
                catch (Exception)
                {
                    productsDetails.EMIStart = null;
                }

                try
                {
                    var pinCode = driver.FindElement(By.XPath("/html/body/main/section/section[2]/div[1]/div[2]/div[2]/section[6]/div/div[2]/p/span[1]"));
                    productsDetails.PinCode = pinCode?.Text.Trim() ?? null;
                }
                catch (Exception)
                {
                    productsDetails.PinCode = null;
                }


                try
                {
                    var address = driver.FindElement(By.XPath("/html/body/main/section/section[2]/div[1]/div[2]/div[2]/section[6]/div/div[2]/p/span[2]"));
                    productsDetails.Address = address?.Text.Trim() ?? null;
                }
                catch (Exception)
                {
                    productsDetails.Address = null;
                }

                try
                {
                    var feature = driver.FindElement(By.XPath("/html/body/main/section/section[2]/div[1]/div[2]/div[2]/section[9]/div[2]/ul"));
                    productsDetails.Feature = feature?.Text.Trim().Replace("\r\n", ", ") ?? null;
                }
                catch (Exception)
                {
                    productsDetails.Feature = null;
                }

                try
                {
                    driver.FindElement(By.XPath("/html/body/main/section/section[2]/div[1]/div[2]/div[2]/section[11]/div[3]/button")).Click();
                    var specification = driver.FindElement(By.XPath("/html/body/main/section/section[2]/div[1]/div[2]/div[2]/section[11]"));
                    productsDetails.Specification = specification?.Text.Trim().Replace("\r\n", ", ") ?? null;
                }
                catch (Exception)
                {
                    productsDetails.Specification = null;
                }

                try
                {
                    var parentDiv = driver.FindElement(By.CssSelector("div.swiper-wrapper.swiper-thumb-wrapper"));

                    var imageTags = parentDiv.FindElements(By.CssSelector("img"));
                    List<string> imageSrcList = new List<string>();

                    foreach (var imgTag in imageTags)
                    {
                        string srcValue = imgTag.GetAttribute("src");
                        if (!string.IsNullOrEmpty(srcValue))
                        {
                            imageSrcList.Add(srcValue);
                        }
                    }
                    productsDetails.ImageLinks = string.Join(", ", imageSrcList);
                }
                catch (Exception)
                {
                    productsDetails.ImageLinks = null;
                }
            }

            using (var httpClient = new HttpClient())
            {
                var response = httpClient.GetStringAsync(url).Result;

                var htmlDoc = new HtmlDocument();
                htmlDoc.LoadHtml(response);

                var nameNode = htmlDoc.DocumentNode.SelectSingleNode("//*[@id=\"pdp_product_name\"]");
                productsDetails.ProductName = nameNode?.InnerText.Trim() ?? null;

                var emiOffer = htmlDoc.DocumentNode.SelectSingleNode("//span[@class='payment_tag']");
                productsDetails.EMIOffer = emiOffer?.InnerText.Trim() ?? null;

            }
            var json = JsonConvert.SerializeObject(productsDetails);

            return json;
        }
    }
}
