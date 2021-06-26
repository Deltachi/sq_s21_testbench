const gecko = require("geckodriver"); // firefox driver
const firefox = require("selenium-webdriver/firefox"); // firefox-browser
const { Builder, By, Key, until } = require("selenium-webdriver"); // selenium
const { test, expect, beforeAll, beforeEach, afterAll } = require("@jest/globals"); // jest test-suite

const options = new firefox.Options(); // optional

const loginPage = "https://test7.ilias.de/login.php?target=root_1&client_id=test7&cmd=force_login&lang=de";
const testPage =
	"https://test7.ilias.de/ilias.php?ref_id=69540&cmd=infoScreen&cmdClass=ilobjtestgui&cmdNode=bc:um&baseClass=ilRepositoryGUI&ref_id=69540";

let driver; // web-crawling bot

function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

async function setupDriver() {
	driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).build();
}

async function login() {
	try {
		await driver.get(loginPage);
		await driver.findElement(By.name("username")).sendKeys("Scheffler");
		await driver.findElement(By.name("password")).sendKeys("houazfn1", Key.RETURN);
		await driver.wait(until.elementLocated(By.className("abbreviation")), 30000);
	} catch {
		return false;
	} finally {
		return true;
	}
}

async function test1() {
	let result = null;
	try {
		await driver.get(testPage);
		let button;
		try {
			button = await driver.findElement(By.name("cmd[startPlayer]")); // ein Test der neu gestartet wird hat einen anderen Button als
		} catch {
			button = await driver.findElement(By.name("cmd[resumePlayer]")); // ein Test, welcher fortgesetzt werden kann
		} finally {
			button.click();
		}

		await driver.wait(until.elementsLocated(By.id("listofquestions")), 30000);
		await driver.findElement(By.id("listofquestions")).findElement(By.linkText("Freitext")).click();

		await driver.wait(until.elementsLocated(By.css("iframe.tox-edit-area__iframe")), 30000);
		await driver.switchTo().frame(driver.findElement(By.css("iframe.tox-edit-area__iframe"))); // switch to iframe

		await driver
			.findElement(By.css(".mce-content-body"))
			.sendKeys("Hallo das ist ein Text, genereiert von Selenium!");
		await sleep(500);
		result = await driver.findElement(By.css(".mce-content-body p")).getText();

		await driver.switchTo().defaultContent(); // switch back to normal content
	} catch (err) {
		console.error("Error: ", err);
	} finally {
	}
	return result;
}

beforeAll(async () => {
	await setupDriver(); // bot init
	await login(); // login to ilias
}, 10000);

// beforeEach(async () => {
// 	return await login(); // login to ilias
// });

afterAll(async () => {
	return await driver.quit(); // browser schließen
});

test("Login + Start Test + Fill Freeform", async () => {
	const result1 = await test1();
	expect(result1).toBe("Hallo das ist ein Text, genereiert von Selenium!");
}, 20000);
