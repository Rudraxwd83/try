const puppeteer = require('puppeteer');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const browser = await puppeteer.launch({ headless: false });
const page = await browser.newPage();

browser.setBypassCSP(true);

const loginWithJson = async (jsonPath) => {
    const url = 'https://m.facebook.com/login.php';
    const credentials = JSON.parse(fs.readFileSync(jsonPath));
    const email = credentials.email;
    const password = credentials.password;

    await page.goto(url);
    await page.type('input[name="email"]', email);
    await page.type('input[name="pass"]', password);
    await page.click('button[name="login"]');

    await page.waitForNavigation();
    console.log(await page.title());
};

const openLink = async (msg4) => {
    await page.goto(msg4);
    await page.waitForSelector('textarea[name="comment_text"]');
    const field_value = '2';
    await page.evaluate((field_value) => {
        document.querySelector('textarea[name="comment_text"]').setAttribute('rows', field_value);
    }, field_value);
    await page.click('button[type="submit"]');
};

const main = async () => {
    rl.question('Enter the path to your JSON file containing your credentials: ', async (jsonPath) => {
        rl.question('Enter the time interval (in seconds): ', async (msg6) => {
            rl.question('Enter your Facebook bookmark link: ', async (msg4) => {
                // Convert seconds to milliseconds
                const timeInterval = msg6 * 1000;

                await loginWithJson(jsonPath);

                while (true) {
                    try {
                        await openLink(msg4);
                        console.log('Message Successfully Sent');
                        await page.waitForTimeout(timeInterval);
                    } catch (error) {
                        console.error(error);
                        await page.waitForTimeout(30000);
                    }
                }
                rl.close();
            });
        });
    });
};

main();
