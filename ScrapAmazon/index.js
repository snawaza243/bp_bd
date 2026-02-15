const { Builder, By } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

// Define your search keywords
const keywords = [
    'phone',
    'laptop',
    // 'display',
];



// Function to scrape products from amazon
async function amazonProductScraper() {
    let driver = await new Builder().forBrowser('chrome').build();
    let data = [];

    try {
        for (let keyword of keywords) {
            const link = `https://www.amazon.in/s?k=${encodeURIComponent(keyword)}`;

            console.log(`Navigating to: ${link}`);
            await driver.get(link);

            // Wait for the page to load completely
            await driver.sleep(5000); // Adjust the sleep time as needed

            // Print page HTML to console for debugging
            // const pageSource = await driver.getPageSource();
            //   console.log('Page HTML:', pageSource);

            // Extract items

            const amazonProducts = await driver.findElements(By.className('s-result-item'));
            console.log('Found items: ', amazonProducts.length);

            for (let item of amazonProducts) {
                try {
                    const productTitle = await item.findElement(By.className('a-size-mini'));
                    const productLink = await item.findElement(By.tagName('a'));
                    const productPrice = await item.findElement(By.className('a-price-whole'))
                    const imageElement = await item.findElement(By.tagName('img'));

                    const title = await productTitle.getText();
                    const url = await productLink.getAttribute('href');
                    const price = await productPrice.getText();
                    const image = await imageElement.getAttribute('src');
                    data.push({
                        title: title || 'No title',
                        link: url || 'No URL',
                        price: price || 'No Price',
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

    const filePath = path.join(__dirname, 'AmazonProduct.xlsx');
    xlsx.writeFile(workbook, filePath);
    console.log(`Data saved to ${filePath}`);
}

// Main function to run the scraper
(async () => {
    try {
        const products = await amazonProductScraper();
        saveToExcel(products);
    } catch (error) {
        console.error('Error:', error);
    }
})();


