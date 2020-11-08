const fs = require('fs').promises;
const Excel = require('exceljs');

/**
 * writes to excel file
 * @param {JSON[]} data Array containing details of the each post within
 * value attrib
 */
async function writeDataToExcel(data) {
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('listings');
    const attribSet = new Set();

    data.forEach((fetchResult) => {
        if (fetchResult.status !== 'fulfilled') return false;
        Object.keys(fetchResult.value).forEach((attrib) => attribSet.add(attrib));
    });

    let headers = [];
    for (let attrib of attribSet) {
        headers.push({ header: attrib, key: attrib });
    }

    worksheet.columns = headers;

    data.forEach((fetchResult) => {
        if (fetchResult.status !== 'fulfilled') return false;
        worksheet.addRow(fetchResult.value);
    });

    try {
        const filename = `${new Date().toDateString()}-listing.xlsx`;
        const file = await fs.open(filename, 'w');
        await workbook.xlsx.writeFile(filename).then(() => console.log('file saved')).catch((err) => console.log(err));
        file.close();
    } catch (err) {
        console.log(err);
    }
}

module.exports = writeDataToExcel;