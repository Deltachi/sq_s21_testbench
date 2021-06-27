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

async function deleteAnswer(test: string = ""): Promise<boolean> {
	try {
		const dropdown = await driver.findElement(By.id("ilAdvSelListAnchorText_QuestionActions"));
		//await driver.wait(until.elementIsVisible(dropdown), 2000);
		//dropdown.click(); //overlapping elements buggggging regular click out
		await sleep(500); // alternative way
		driver.executeScript("arguments[0].click();", dropdown); // alternative way
		const deleteBtn = await driver.findElement(By.id("tst_discard_solution_action"));
		await driver.wait(until.elementIsVisible(deleteBtn), 2000);
		const deleteClasses = await deleteBtn.findElement(By.xpath("..")).getAttribute("class");
		// wenn das li element (eltern) disabled ist kann die Aufgabe nicht gelöscht werden
		if (deleteClasses.indexOf("disabled") >= 0) {
			return false;
		}
		deleteBtn.click();
		await sleep(500);
		await driver.wait(until.elementLocated(By.name("cmd[discardSolution]")), 1000);
		await driver.findElement(By.name("cmd[discardSolution]")).click();
		await sleep(1000);
		return true;
	} catch (err) {
		console.error(`DELETE ANSWER (test=${test}): ${err}`);
		return false;
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

test("Fill freeform, click save and immediate reload", async () => {
	const result = await fillFreeFormSaveReloadAndCheck("Hallo das ist ein Text, genereiert von Selenium!");
	expect(result).toBe("Hallo das ist ein Text, genereiert von Selenium!"); // failed, weil Speichern NICHT speichert
}, 20000);

test("Mark text switch to overview and back", async () => {
	const result = await markWordsReloadAndCheck();
	expect(result).toBeTruthy(); // sollte wahr sein, weil die Auswahl gespeichert wird
}, 20000);

//###########################
// BEGIN TEST SUB-FUNCTIONS #
//###########################
//
/**
 * Fügt Text in ein Freitextfeld ein, klickt auf speichern und lädt die Seite neu
 * @param text Testtext welcher eingefügt werden soll
 * @returns Text innerhalb des Editors nach dem Test
 */
async function fillFreeFormSaveReloadAndCheck(text: string) {
	let result = null;
	try {
		await startTest();

		await driver.wait(until.elementsLocated(By.id("listofquestions")), 30000);
		await driver.findElement(By.id("listofquestions")).findElement(By.linkText("Freitext")).click();

		await driver.wait(until.elementsLocated(By.css("iframe.tox-edit-area__iframe")), 30000);

		await deleteAnswer();

		await driver.switchTo().frame(driver.findElement(By.css("iframe.tox-edit-area__iframe"))); // switch to iframe to input into tiny-mce editor

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

async function markWordsReloadAndCheck(): Promise<boolean> {
	try {
		await startTest();
		await driver.wait(until.elementsLocated(By.id("listofquestions")), 30000);
		await driver.findElement(By.id("listofquestions")).findElement(By.linkText("Worte markieren")).click();
		await driver.wait(until.elementsLocated(By.linkText("falsch")), 30000);

		await deleteAnswer();

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
