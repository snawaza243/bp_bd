const { Builder, By } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

// Define your search keywords
const keywords = [
  'esg news today',
  'sustainability news',
  'esg global news',
  'esg news global',
  'environmental social and governance',
  'esg sustainability'
];



// Function to scrape news
async function googleNewsScraper() {
  let driver = await new Builder().forBrowser('chrome').build();
  let data = [];

  try {
    for (let keyword of keywords) {
      const link = `https://www.google.co.in/search?q=${encodeURIComponent(keyword)}+news&tbm=nws`;
      console.log(`Navigating to: ${link}`);
      await driver.get(link);

      // Wait for the page to load completely
      await driver.sleep(5000); // Adjust the sleep time as needed

      // Print page HTML to console for debugging
      const pageSource = await driver.getPageSource();
      //   console.log('Page HTML:', pageSource);

      // Extract news items
      const newsItems = await driver.findElements(By.className('SoaBEf'));
      console.log('Found news items:', newsItems.length);

      for (let item of newsItems) {
        try {
          const titleElement = await item.findElement(By.className('nDgy9d'));
          const linkElement = await item.findElement(By.tagName('a'));
          const descriptionElement = await item.findElement(By.className('GI74Re'));
          const sourceElement = await item.findElement(By.className('MgUUmf'));
          const dateElement = await item.findElement(By.className('OSrXXb'));
          const imageElement = await item.findElement(By.tagName('img'));
          const title = await titleElement.getText();
          const url = await linkElement.getAttribute('href');
          const description = await descriptionElement.getAttribute('src');
          const source = await sourceElement.getText();
          const date = await dateElement.getText();
          const image = await imageElement.getAttribute('src');
          data.push({
            title: title || 'No title',
            link: url || 'No URL',
            description: description || 'No description',
            source: source || 'No source',
            date: date || 'No date',
            image: image || 'No image'
          });

        } catch (e) {
          console.error(`Error extracting data: ${e}`);
        }
      }
    }
  } finally {
    await driver.quit();
  }

  return data;
}

// Function to save data to Excel
function saveToExcel(data) {
  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.json_to_sheet(data);
  xlsx.utils.book_append_sheet(workbook, worksheet, 'News');

  const filePath = path.join(__dirname, 'Esg_news.xlsx');
  xlsx.writeFile(workbook, filePath);
  console.log(`Data saved to ${filePath}`);
}

// Main function to run the scraper
(async () => {
  try {
    const news = await googleNewsScraper();
    saveToExcel(news);
  } catch (error) {
    console.error('Error:', error);
  }
})();
