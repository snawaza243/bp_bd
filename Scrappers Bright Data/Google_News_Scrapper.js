

const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { DateTime } = require('luxon');  // Importing Luxon for date parsing

// Define your search keywords
const keywords = [
  'environmental social and governance',
  'esg global',
  'sustainability', 
];

// Number of pages to scrape
const pages = [0, 10, 20];

// Scrapes Google news articles
async function googleNewsScraper() {

  require('chromedriver');

  // instane of chrome driver
  let options = new chrome.Options();
  options.addArguments('headless');  // Run Chrome in headless mode

  let driver = await new Builder()
          .forBrowser('chrome')
          .setChromeOptions(options)
          .build();

  let data = [];

  try {
    for (let keyword of keywords) {
      console.log(`Scraping news for keyword: ${keyword}`);
      for (let page of pages) {
        const link = `https://www.google.co.in/search?q=${encodeURIComponent(keyword)}&tbm=nws&start=${encodeURIComponent(page)}`;
        console.log(`Navigating to: ${link}`);
        await driver.get(link);

        // Wait for the page to load completely
        await driver.sleep(5000); // Adjust the sleep time as needed

        // Extract news items
        const newsItems = await driver.findElements(By.className('SoaBEf'));
        // console.log('Found news items:', newsItems.length);

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
            const description = await descriptionElement.getText();
            const source = await sourceElement.getText();
            let date = await dateElement.getText();
            const image = await imageElement.getAttribute('src');

            // Parse and replace the date field
            if (date) {
              date = parseDate(date);
            }

            data.push({
              title: title || 'No title',
              description: description || 'No description',
              date: date || 'No date',
              link: url || 'No URL',
              source: source || 'No source',
              image: image || 'No image'
            });
          } catch (e) {
            console.error(`Error extracting data: ${e}`);
          }
        }
      }
    }

    return data;
  } finally {
    await driver.quit();
  }
}


function parseDate(dateString) {
  let parsedDate;

  // Handle absolute date format like "11 Apr 2024"
  parsedDate = DateTime.fromFormat(dateString, 'd MMM yyyy');
  
  // If absolute date parsing fails, handle relative date formats
  if (!parsedDate.isValid) {
    if (dateString.includes("day")) {
      const daysAgo = parseInt(dateString.match(/\d+/)[0], 10);
      parsedDate = DateTime.now().minus({ days: daysAgo });
    } else if (dateString.includes("hour")) {
      const hoursAgo = parseInt(dateString.match(/\d+/)[0], 10);
      parsedDate = DateTime.now().minus({ hours: hoursAgo });
    } else if (dateString.includes("minute")) {
      const minutesAgo = parseInt(dateString.match(/\d+/)[0], 10);
      parsedDate = DateTime.now().minus({ minutes: minutesAgo });
    } else if (dateString.includes("week")) {
      const weeksAgo = parseInt(dateString.match(/\d+/)[0], 10);
      parsedDate = DateTime.now().minus({ weeks: weeksAgo });
    } else if (dateString.includes("month")) {
      const monthsAgo = parseInt(dateString.match(/\d+/)[0], 10);
      parsedDate = DateTime.now().minus({ months: monthsAgo });
    } else {
      parsedDate = DateTime.now(); // Default to current date if format is unknown
    }
  }

  return parsedDate.toFormat('dd-MM-yyyy'); // Convert to 'DD-MM-YYYY' format
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
