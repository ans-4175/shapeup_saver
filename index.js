const puppeteer = require('puppeteer');
const deviceUsed = puppeteer.devices['iPad landscape'];

const printPage = async (page) => {
  const urlString = await page.url();
  const fileName = extractFileName(urlString);
  const { width, height } = await getWidthHeight(page)
  await page.setViewport({width, height})
  await page.addStyleTag({
    content: '#main > div.intro > div > button { display: none} .pagination { display: none} .footer { display: none}'
  })
  console.log(`Saving to pdf ${urlString}`);
  await page.pdf({
    path: fileName,
    margin: { top: 17, bottom: 20 },
    format: 'A4'
  });
}

const getWidthHeight = async (page) => {
  const width = await page.evaluate(
      () => document.documentElement.offsetWidth
  );
  const height = await page.evaluate(
      () => document.documentElement.offsetHeight
  ); 

  return { width, height }
}

const extractFileName = (urlString) => {
  return `./export_path/${urlString.split('/').pop()}.pdf`;
}

(async () => {
    let isNextExist = true;
    const browser = await puppeteer.launch({
        headless: true
    });

    const page = await browser.newPage();
    await page.emulate(deviceUsed);
    await page.goto('https://basecamp.com/shapeup/0.1-foreword', {
        waitUntil: "networkidle0"
    });
    
    while (isNextExist) {
      await printPage(page)
      isNextExist = (await page.$('body > #main > .content > .pagination > .button') !== null) ? true : false;
      if (isNextExist) {
        await page.evaluate(() => {
          document.querySelector('body > #main > .content > .pagination > .button').click();
        });
        await page.waitForNavigation({ waitUntil: 'networkidle0' });    
      }
    }

    await browser.close();
})();