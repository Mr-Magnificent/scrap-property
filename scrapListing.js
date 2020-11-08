const cheerio = require('cheerio');
const fetch = require('node-fetch');

/**
 * @param {String} url url of page
 * @returns {Promise<JSON>} data of the page
 */
function getPageListingDataPromise(url) {
    return new Promise(async (resolve, reject) => {
        try {
            const body = await fetch(url).then(res => res.text());
            const $ = cheerio.load(body);

            const data = {};

            $('.itemFacts > tbody > tr').each((_, ele) => {
                const field = $(ele).find('th > span');
                const value = $(ele).find('td > span');
                data[field.text()] = value.text();
            });

            resolve(data);
        } catch (err) {
            console.log(err.stack);
            reject(err);
        }
    });
}

/**
 * Scraps ad page and gives the content within
 * @param {String[]} urls array of urls of ad post on dashboard
 * @returns {JSON[]} returns scraped data of all the urls passed
 */
async function getPageListingData(urls) {
    const listingData = [];
    urls.forEach((url) => listingData.push(getPageListingDataPromise(url)));

    return await Promise.allSettled(listingData);
}

module.exports = getPageListingData;
