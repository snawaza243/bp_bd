using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using ClosedXML.Excel;

namespace AmazonScraper
{
    class Program
    {
        // Define your search keywords
        static readonly string[] keywords = { "phone", "laptop" };

        static async Task Main(string[] args)
        {
            var products = await AmazonProductScraper();
            SaveToExcel(products);
        }

        static async Task<List<Product>> AmazonProductScraper()
        {
            var options = new ChromeOptions();
            options.AddArgument("--headless"); // Run in headless mode
            var driver = new ChromeDriver(options);
            var data = new List<Product>();

            foreach (var keyword in keywords)
            {
                var link = $"https://www.amazon.in/s?k={Uri.EscapeDataString(keyword)}";
                Console.WriteLine($"Navigating to: {link}");
                driver.Navigate().GoToUrl(link);

                // Wait for the page to load completely
                await Task.Delay(5000);

                // Extract items
                var amazonProducts = driver.FindElements(By.ClassName("s-result-item"));
                Console.WriteLine($"Found items: {amazonProducts.Count}");

                foreach (var item in amazonProducts)
                {
                    try
                    {
                        var productTitleElement = item.FindElement(By.ClassName("a-size-mini"));
                        var productLinkElement = item.FindElement(By.TagName("a"));
                        var productPriceElement = item.FindElement(By.ClassName("a-price-whole"));
                        var imageElement = item.FindElement(By.TagName("img"));

                        var title = productTitleElement.Text;
                        var url = productLinkElement.GetAttribute("href");
                        var price = productPriceElement.Text;
                        var image = imageElement.GetAttribute("src");

                        data.Add(new Product
                        {
                            Title = title ?? "No title",
                            Link = url ?? "No URL",
                            Price = price ?? "No Price",
                            Image = image ?? "No image"
                        });
                    }
                    catch (NoSuchElementException)
                    {
                        // Ignore if any element is not found
                    }
                }
            }

            return data;
        }

        static void SaveToExcel(List<Product> data)
        {
            var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Amazon Products");
            worksheet.Cell(1, 1).Value = "Title";
            worksheet.Cell(1, 2).Value = "Link";
            worksheet.Cell(1, 3).Value = "Price";
            worksheet.Cell(1, 4).Value = "Image";

            for (int i = 0; i < data.Count; i++)
            {
                worksheet.Cell(i + 2, 1).Value = data[i].Title;
                worksheet.Cell(i + 2, 2).Value = data[i].Link;
                worksheet.Cell(i + 2, 3).Value = data[i].Price;
                worksheet.Cell(i + 2, 4).Value = data[i].Image;
            }

            var filePath = Path.Combine(Environment.CurrentDirectory, "AmazonProduct.xlsx");
            workbook.SaveAs(filePath);
            Console.WriteLine($"Data saved to {filePath}");
        }
    }

    class Product
    {
        public string Title { get; set; }
        public string Link { get; set; }
        public string Price { get; set; }
        public string Image { get; set; }
    }
}
