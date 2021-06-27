const gecko = require("geckodriver"); // firefox driver
import firefox from "selenium-webdriver/firefox"; // firefox-browser
import { Builder, By, Key, ThenableWebDriver, until, WebDriver } from "selenium-webdriver"; // selenium
import { test, expect, beforeAll, beforeEach, afterAll } from "@jest/globals"; // jest test-suite

const options = new firefox.Options(); // optional

const loginPage = "https://test7.ilias.de/login.php?target=root_1&client_id=test7&cmd=force_login&lang=de";
const testPage =
	"https://test7.ilias.de/ilias.php?ref_id=69540&cmd=infoScreen&cmdClass=ilobjtestgui&cmdNode=bc:um&baseClass=ilRepositoryGUI&ref_id=69540";

let driver: WebDriver; // web-crawling bot

/**
 * "Fake" sleep function to stop skript for x ms.
 * @param {number} ms Milliseconds to sleep
 * @returns Promise for the timeout function - resolve
 */
function sleep(ms: number) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

/**
 * Initializes the webdriver
 * @returns WebDriver
 */
async function createDriver(): Promise<WebDriver> {
	return await new Builder().forBrowser("firefox").setFirefoxOptions(options).build();
}

/**
 * Attempts to login the driver with user credentials
 * @returns true if login was successfull
 */
async function login(): Promise<boolean> {
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

/**
 * Navigates the driver to the Test page and clicks the resume or start button
 */
async function startTest() {
	await driver.get(testPage);
	let button;
	try {
		button = await driver.findElement(By.name("cmd[startPlayer]")); // ein Test der neu gestartet wird hat einen anderen Button als
	} catch {
		button = await driver.findElement(By.name("cmd[resumePlayer]")); // ein Test, welcher fortgesetzt werden kann
	} finally {
		button.click();
	}
}

beforeAll(async () => {
	driver = await createDriver(); // bot init
	await login(); // login to ilias
}, 10000);

// beforeEach(async () => {
// });

afterAll(async () => {
	await sleep(3000);
	await driver.quit(); // browser schließen
});

/**
 * Dieser Test schlägt fehl, weil ILIAS den Editor Content nicht speichert beim Klicken auf Speichern, wenn das Fenster 3s danach neu geladen wird.
 */
// test("Fill freeform, click save and immediate reload", async () => {
// 	const result = await fillFreeFormSaveAndReload("Hallo das ist ein Text, genereiert von Selenium!");
// 	expect(result).toBe("Hallo das ist ein Text, genereiert von Selenium!");
// }, 20000);

async function fillFreeFormSaveAndReload(text: string) {
	let result = null;
	try {
		await startTest();

		await driver.wait(until.elementsLocated(By.id("listofquestions")), 30000);
		await driver.findElement(By.id("listofquestions")).findElement(By.linkText("Freitext")).click();

		await driver.wait(until.elementsLocated(By.css("iframe.tox-edit-area__iframe")), 30000);
		await driver.switchTo().frame(driver.findElement(By.css("iframe.tox-edit-area__iframe"))); // switch to iframe

		await driver.findElement(By.css(".mce-content-body")).sendKeys(text);

		await driver.switchTo().defaultContent(); // switch back to normal content

		await sleep(500);
		await driver.findElement(By.css(".tox-toolbar__group > .tox-tbtn:nth-child(1) svg")).click(); // save button of tiny mce editor
		await sleep(3000);
		await driver.navigate().refresh();
		await sleep(500);

		await driver.switchTo().frame(driver.findElement(By.css("iframe.tox-edit-area__iframe"))); // switch to iframe
		result = await driver.findElement(By.css(".mce-content-body p")).getText();

		await driver.switchTo().defaultContent(); // switch back to normal content
	} catch (err) {
		console.error("Error: ", err);
	} finally {
	}
	return result;
}

test("Mark text switch to overview and back", async () => {
	const result = await markWords();
	expect(result).toBeTruthy();
}, 20000);

async function markWords(): Promise<boolean> {
	try {
		await startTest();
		await driver.wait(until.elementsLocated(By.id("listofquestions")), 30000);
		await driver.findElement(By.id("listofquestions")).findElement(By.linkText("Worte markieren")).click();
		await driver.wait(until.elementsLocated(By.linkText("falsch")), 30000);
		await (
			await driver.findElements(By.linkText("falsch"))
		).forEach(async (element) => {
			await element.click();
		});
		await sleep(2000);
		await driver.findElement(By.linkText("Bearbeitungsstand")).click();

		await driver.wait(until.elementsLocated(By.id("listofquestions")), 30000);
		await driver.findElement(By.id("listofquestions")).findElement(By.linkText("Worte markieren")).click();
		await driver.wait(until.elementsLocated(By.linkText("falsch")), 30000);
		let elements = await await driver.findElements(By.linkText("falsch"));
		for (let i = 0; i < elements.length; i++) {
			let classes = await elements[i].getAttribute("class");
			if (classes !== "ilc_qetitem_ErrorTextSelected") return false;
		}
		return true;
	} catch (err) {
		console.error("Error: ", err);
		return false;
	} finally {
	}
}
