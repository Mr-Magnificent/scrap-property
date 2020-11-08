const fs = require('fs').promises;
const puppeteer = require('puppeteer');

const getPageListingData = require('./scrapListing');
const writeDataToExcel = require('./writeToExcel');

async function createInstance() {
    const browser = await puppeteer.launch({
        headless: false,
    });

    const pages = await browser.pages();
    const page = pages[0];
    await page.goto("https://www.city24.ee/en/", { waitUntil: "networkidle2" });
    await searchTerms(page);

    const searchResults = await paginateResults(page);
    await writeDataToExcel(searchResults);

    await browser.close();
}

/**
 * reads search terms from json file and populates in page
 * @param {Page} page
 */
async function searchTerms(page) {
    const search = JSON.parse(await fs.readFile('./searchTerms.json'));
    console.log(search);
    await page.$eval('#display_text', (el, search) => el.value = search.address, search);
    await page.click('#display_text');

    const roomsOptions = await page.$$(".rooms-select a");

    search['#rooms'].forEach(room => {
        roomsOptions[room - 1].click();
    });
    await page.$eval('.searchButton', el => el.click());
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
}

/**
 * Iterates over all the links in current page and scraps it
 * using scrapeListing.js
 * @param {Page} page the current page for dashboard
 * @returns {JSON[]} Array containing details of the each post within
 * value attrib
 */
async function paginateResults(page) {
    let results = [];
    let noNextPage;
    do {
        let urlArray = await page.$$eval('.new.result.regular .addressLink', (aTags) => {
            return aTags.map((a) => $(a).attr('href'));
        });

        console.log("str len", urlArray.length);
        results = [...results, await getPageListingData(urlArray)].flat();
        console.log(results.length);

        // change the page
        noNextPage = await page.$('.next.disabled');
        if (!noNextPage) {
            await Promise.all([
                page.waitForNavigation(), // The promise resolves after navigation has finished
                page.click('.next'), // Clicking the link will indirectly cause a navigation
            ]);
        }
    } while (!noNextPage);
    return results;
}

createInstance();

/**
 * @typedef Page
 * @type {import('puppeteer').Page}
 */