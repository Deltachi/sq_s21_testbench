const gecko = require("geckodriver"); // firefox driver
import firefox from "selenium-webdriver/firefox"; // firefox-browser
import { Builder, By, Key, ThenableWebDriver, until, WebDriver } from "selenium-webdriver"; // selenium
import { test, expect, beforeAll, beforeEach, afterAll } from "@jest/globals"; // jest test-suite
import { createDriver, login, sleep, startTest, deleteAnswer, switchToQuestion, switchToOverview, logVar, endTest, Timer } from "./helpers";

const options = new firefox.Options(); // optional

const loginPage = "https://test7.ilias.de/login.php?target=root_1&client_id=test7&cmd=force_login&lang=de";
const testPage =
	"https://test7.ilias.de/ilias.php?ref_id=69540&cmd=infoScreen&cmdClass=ilobjtestgui&cmdNode=bc:um&baseClass=ilRepositoryGUI&ref_id=69540";
const resultPage =
	"https://test7.ilias.de/ilias.php?ref_id=69540&active_id=14519&cmdClass=iltestevaluationgui&cmdNode=bc:um:tl:us:uf&baseClass=ilRepositoryGUI";

let driver: WebDriver; // web-crawling bot
const elementWaitTimeout = 5000;

beforeAll(async () => {
	driver = await createDriver(options); // bot init
	await login(driver, loginPage); // login to ilias
}, 10000);

// beforeEach(async () => {
// });

afterAll(async () => {
	await sleep(2000);
	await driver.quit(); // browser schließen
});

test("Fill Freeform, Save and Reload", async () => {
	const result = await fillFreeFormSaveReloadAndCheck("Hallo das ist ein Text, genereiert von Selenium!");
	expect(result).toBe("Hallo das ist ein Text, genereiert von Selenium!"); // failed, weil Speichern NICHT speichert
}, 20000);

test("Mark Text and Switch", async () => {
	const result = await markWordsReloadAndCheck();
	expect(result).toBeTruthy(); // sollte wahr sein, weil die Auswahl gespeichert wird
}, 20000);

test("K-Prim and Switch", async () => {
	const result = await kPrimAndSwitch();
	expect(result).toBeTruthy(); // sollte wahr sein, weil die Auswahl gespeichert wird
}, 20000);

test("Begriffe and Switch", async () => {
	const result = await begriffeAndSwitch();
	expect(result).toBeTruthy(); // sollte wahr sein, weil die Auswahl gespeichert wird
}, 20000);

test("Lückentext and Switch", async () => {
	const result = await lueckentextAndSwitch("Lückentext");
	expect(result).toBe("Lückentext"); // sollte wahr sein, weil die Auswahl gespeichert wird
}, 20000);

test("Multiple Choice and Switch", async () => {
	const result = await multipleChoiceAndSwitch();
	expect(result).toBeTruthy(); // sollte wahr sein, weil die Auswahl gespeichert wird
}, 20000);

test("Single Choice and Switch", async () => {
	const result = await singleChoiceAndSwitch();
	expect(result).toBeTruthy(); // sollte wahr sein, weil die Auswahl gespeichert wird
}, 20000);

test("Numerische Frage and Switch", async () => {
	const result = await numericInputAndSwitch(42);
	expect(result).toBe(42); // sollte wahr sein, weil die Auswahl gespeichert wird
}, 20000);

test.skip("Erreiche < 50% im Test und falle durch", async () => {
	const result = await failAt49Percent();
	expect(result).toBeTruthy(); // sollte wahr sein, weil die Auswahl gespeichert wird
}, 110000);

test.skip("Erreiche >= 50% im Test und bestehe", async () => {
	const result = await pass50Percent();
	expect(result).toBeTruthy(); // sollte wahr sein, weil die Auswahl gespeichert wird
}, 110000);

test.skip("Time (active tab) Test", async () => {
	const result = await timeActiveTest(22);
	expect(result).toBeLessThan(3); // Die Abweichung sollte weniger als 3 Sekunden sein
}, 100000); // max 100 sec Test

test.skip("Time (inactive tab) Test", async () => {
	const result = await timeInactiveTest(22);
	expect(result).toBeLessThan(3); // Die Abweichung sollte weniger als 3 Sekunden sein
}, 100000); // max 100 sec Test

test.only("Time (closed tab) Test", async () => {
	const result = await timeClosedTest(22);
	expect(result).toBeLessThan(3); // Die Abweichung sollte weniger als 3 Sekunden sein
}, 100000); // max 100 sec Test

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
		await startTest(driver, testPage);

		await switchToQuestion(driver, "Freitext");

		await driver.wait(until.elementsLocated(By.css("iframe.tox-edit-area__iframe")), elementWaitTimeout);

		await deleteAnswer(driver);

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
		// Vorbedingung
		await startTest(driver, testPage);
		await switchToQuestion(driver, "Worte markieren");
		await driver.wait(until.elementsLocated(By.linkText("falsch")), elementWaitTimeout);

		await deleteAnswer(driver);

		// Durchführung
		await (
			await driver.findElements(By.linkText("falsch"))
		).forEach(async (element) => {
			await element.click();
		});
		await sleep(2000);
		await driver.findElement(By.linkText("Bearbeitungsstand")).click();

		await switchToQuestion(driver, "Worte markieren");
		await driver.wait(until.elementsLocated(By.linkText("falsch")), elementWaitTimeout);

		// Prüfen
		let elements = await await driver.findElements(By.linkText("falsch"));
		for (let i = 0; i < elements.length; i++) {
			let className = await elements[i].getAttribute("class");
			if (className !== "ilc_qetitem_ErrorTextSelected") return false; // wenn element nicht ausgewählt ist
		}
		return true;
	} catch (err) {
		console.error("Error: ", err);
		return false;
	} finally {
	}
}

async function kPrimAndSwitch() {
	let radios: Array<boolean> = [];
	try {
		// Vorbereitung
		await startTest(driver, testPage);
		await switchToQuestion(driver, "K-Prim Choice");
		await driver.wait(until.elementsLocated(By.xpath("//input[@id='0']")), elementWaitTimeout);
		await sleep(500);

		await deleteAnswer(driver);

		await sleep(500);

		// Durchführung
		// Musterlösung
		await driver.findElement(By.xpath("//input[@id='0']")).click();
		await driver.findElement(By.xpath("(//input[@id='1'])[2]")).click();
		await driver.findElement(By.xpath("//input[@id='2']")).click();
		await driver.findElement(By.xpath("(//input[@id='3'])[2]")).click();

		await sleep(2000);
		await driver.findElement(By.linkText("Bearbeitungsstand")).click();

		await switchToQuestion(driver, "K-Prim Choice");
		await driver.wait(until.elementsLocated(By.xpath("//input[@id='0']")), elementWaitTimeout);
		await sleep(500);

		// Prüfung
		// Musterlösung?
		radios[0] = await driver.findElement(By.xpath("//input[@id='0']")).isSelected();
		radios[1] = await driver.findElement(By.xpath("(//input[@id='1'])[2]")).isSelected();
		radios[2] = await driver.findElement(By.xpath("//input[@id='2']")).isSelected();
		radios[3] = await driver.findElement(By.xpath("(//input[@id='3'])[2]")).isSelected();

		for (let radio of radios) {
			if (radio === false) return false; // wurde einer nicht gespeichert, dann...
		}
		return true;
	} catch (error) {
		console.error("K-Prim-Error: " + error);

		return false;
	}
}

async function begriffeAndSwitch() {
	let answers: Array<string> = [];
	try {
		// Vorbedingung
		await startTest(driver, testPage);
		await switchToQuestion(driver, "Begriffe");
		await driver.wait(until.elementsLocated(By.name("TEXTSUBSET_01")), elementWaitTimeout);
		await sleep(500);

		await deleteAnswer(driver);

		await sleep(500);

		// Durchführung
		await driver.findElement(By.name("TEXTSUBSET_01")).sendKeys("Antwort 1");
		await driver.findElement(By.name("TEXTSUBSET_02")).sendKeys("Antwort 2");

		await sleep(2000);

		await switchToOverview(driver);
		await switchToQuestion(driver, "Begriffe");
		await driver.wait(until.elementsLocated(By.name("TEXTSUBSET_01")), elementWaitTimeout);
		await sleep(500);

		// Prüfung
		answers[0] = await driver.findElement(By.name("TEXTSUBSET_01")).getAttribute("value");
		answers[1] = await driver.findElement(By.name("TEXTSUBSET_02")).getAttribute("value");

		if (answers[0] !== "Antwort 1" || answers[1] !== "Antwort 2") return false;
		return true;
	} catch (error) {
		console.error("Begriffe-Error: " + error);

		return false;
	}
}

async function lueckentextAndSwitch(input: string): Promise<string> {
	let answer: string = "";
	try {
		// Vorbedingung
		await startTest(driver, testPage);
		await switchToQuestion(driver, "Lückentext");
		await driver.wait(until.elementsLocated(By.name("gap_0")), elementWaitTimeout);
		await sleep(500);

		await deleteAnswer(driver);

		await sleep(500);

		// Durchführung
		await driver.findElement(By.name("gap_0")).sendKeys(input);

		await sleep(2000);

		await switchToOverview(driver);
		await switchToQuestion(driver, "Lückentext");
		await driver.wait(until.elementsLocated(By.name("gap_0")), elementWaitTimeout);
		await sleep(500);

		// Prüfung
		answer = await driver.findElement(By.name("gap_0")).getAttribute("value");

		return answer;
	} catch (error) {
		console.error("Lückentext-Error: " + error);
		return null;
	}
}

async function multipleChoiceAndSwitch() {
	let answers: Array<boolean> = [];
	try {
		// Vorbedingung
		await startTest(driver, testPage);
		await switchToQuestion(driver, "Multiple Choice");
		await driver.wait(until.elementsLocated(By.id("answer_0")), elementWaitTimeout);
		await sleep(500);

		await deleteAnswer(driver);

		await sleep(500);

		// Durchführung
		await driver.findElement(By.id("answer_0")).click();
		await driver.findElement(By.id("answer_2")).click();

		await sleep(2000);

		await switchToOverview(driver);
		await switchToQuestion(driver, "Multiple Choice");
		await driver.wait(until.elementsLocated(By.id("answer_0")), elementWaitTimeout);
		await sleep(500);

		// Prüfung
		answers[0] = await driver.findElement(By.id("answer_0")).isSelected();
		answers[1] = await driver.findElement(By.id("answer_2")).isSelected();

		return !!answers[0] && !!answers[1];
	} catch (error) {
		console.error("Multiple Choice-Error: " + error);
		return false;
	}
}

async function singleChoiceAndSwitch() {
	let answers: Array<boolean> = [];
	try {
		// Vorbedingung
		await startTest(driver, testPage);
		await switchToQuestion(driver, "Single Choice");
		await driver.wait(until.elementsLocated(By.id("answer_0")), elementWaitTimeout);
		await sleep(500);

		await deleteAnswer(driver);

		await sleep(500);

		// Durchführung
		await driver.findElement(By.id("answer_0")).click();

		await sleep(2000);

		await switchToOverview(driver);
		await switchToQuestion(driver, "Single Choice");
		await driver.wait(until.elementsLocated(By.id("answer_0")), elementWaitTimeout);
		await sleep(500);

		// Prüfung
		answers[0] = await driver.findElement(By.id("answer_0")).isSelected();

		return !!answers[0];
	} catch (error) {
		console.error("Single Choice-Error: " + error);
		return false;
	}
}

async function numericInputAndSwitch(input: number): Promise<number> {
	let answer: number;
	try {
		// Vorbedingung
		await startTest(driver, testPage);
		await switchToQuestion(driver, "Numerische Frage");
		await driver.wait(until.elementsLocated(By.name("numeric_result")), elementWaitTimeout);
		await sleep(500);

		await deleteAnswer(driver);

		await sleep(500);

		// Durchführung
		await driver.findElement(By.name("numeric_result")).sendKeys(input);

		await sleep(2000);

		await switchToOverview(driver);
		await switchToQuestion(driver, "Numerische Frage");
		await driver.wait(until.elementsLocated(By.name("numeric_result")), elementWaitTimeout);
		await sleep(500);

		// Prüfung
		answer = Number.parseInt(await driver.findElement(By.name("numeric_result")).getAttribute("value"));

		return answer;
	} catch (error) {
		console.error("Numerische Frage-Error: " + error);
		return null;
	}
}

async function failAt49Percent(): Promise<boolean> {
	try {
		//Vorbedingung
		await startTest(driver, testPage);

		// Durchführung - Beantworte 2 Fragen nicht (resultiert in 19/39 Punkte gesamt)
		await switchToQuestion(driver, "Single Choice");
		await driver.wait(until.elementsLocated(By.id("answer_0")), elementWaitTimeout);
		await sleep(500);

		await deleteAnswer(driver);

		await sleep(500);

		await switchToOverview(driver);
		await switchToQuestion(driver, "Lückentext");
		await driver.wait(until.elementsLocated(By.name("gap_0")), elementWaitTimeout);
		await sleep(500);

		await deleteAnswer(driver);

		await sleep(500);

		await markWordsReloadAndCheck();
		await kPrimAndSwitch();
		await begriffeAndSwitch();
		//await lueckentextAndSwitch("Lückentext"); // - 5p
		await multipleChoiceAndSwitch();
		//await singleChoiceAndSwitch();	// - 5p
		await numericInputAndSwitch(42);

		// Prüfung
		await endTest(driver);
		//await driver.get(resultPage);
		await driver.wait(until.elementsLocated(By.xpath('//*[@id="mainscrolldiv"]/div[3]/div[2]/div')), elementWaitTimeout);
		const result = await driver.findElement(By.xpath('//*[@id="mainscrolldiv"]/div[3]/div[2]/div')).getText();
		return result.indexOf("nicht bestanden") >= 0; //falle durch wenn "nicht bestanden" im alert steht
	} catch (error) {
		console.error(`49% Test error: ${error}`);
		return null;
	}
}

async function pass50Percent(): Promise<boolean> {
	try {
		//Vorbedingung
		await startTest(driver, testPage);

		// Durchführung - Beantworte 2 Fragen nicht (resultiert in 20/39 Punkte gesamt)
		await switchToQuestion(driver, "Single Choice");
		await driver.wait(until.elementsLocated(By.id("answer_0")), elementWaitTimeout);
		await sleep(500);

		await deleteAnswer(driver);

		await sleep(500);

		await switchToOverview(driver);
		await switchToQuestion(driver, "K-Prim Choice");
		await driver.wait(until.elementsLocated(By.xpath("//input[@id='0']")), elementWaitTimeout);
		await sleep(500);

		await deleteAnswer(driver);

		await sleep(500);

		await markWordsReloadAndCheck();
		//await kPrimAndSwitch();	// - 4p
		await begriffeAndSwitch();
		await lueckentextAndSwitch("Lückentext");
		await multipleChoiceAndSwitch();
		//await singleChoiceAndSwitch();	// - 5p
		await numericInputAndSwitch(42);

		// Prüfung
		await endTest(driver);
		//await driver.get(resultPage);
		await driver.wait(until.elementsLocated(By.xpath('//*[@id="mainscrolldiv"]/div[3]/div[2]/div')), elementWaitTimeout);
		const result = await driver.findElement(By.xpath('//*[@id="mainscrolldiv"]/div[3]/div[2]/div')).getText();
		return result.indexOf("nicht bestanden") < 0; //falle nicht durch wenn nicht "nicht bestanden" im alert steht
	} catch (error) {
		console.error(`50% Test error: ${error}`);
		return null;
	}
}

async function timeActiveTest(timeToWait: number = 22): Promise<number> {
	try {
		// Vorbereitung
		await startTest(driver, testPage);
		await switchToQuestion(driver, "K-Prim Choice");
		await sleep(3000);

		// Durchführung
		const timeLeftText = await driver.findElement(By.id("timeleft")).getText();
		Timer.start();

		const regex = /\d+/g;
		let timeStart = timeLeftText.match(regex);
		//logVar("Time start", timeStart);
		await sleep(timeToWait * 1000);

		const actualTime = Timer.end();
		const timeNowText = await driver.findElement(By.id("timeleft")).getText();
		let timeEnd = timeNowText.match(regex);

		// Prüfung
		let timeCmp = [Number.parseInt(timeStart[0]) - Math.floor(actualTime / 60), Number.parseInt(timeStart[1]) - (actualTime % 60)];
		timeCmp[0] = timeCmp[1] < 0 ? timeCmp[0] - 1 : timeCmp[0];
		timeCmp[1] = timeCmp[1] < 0 ? timeCmp[1] + 60 : timeCmp[1];

		// logVar("Time cmp", timeCmp);
		// logVar("Time end", timeEnd);

		const timeEnd_0 = Number.parseInt(timeEnd[0]);
		const timeEnd_1 = Number.parseInt(timeEnd[1]);

		await endTest(driver);

		return timeEnd_0 === timeCmp[0] ? Math.abs(timeEnd_1 - timeCmp[1]) : 999; //Abweichung in der Zeit
		//return timeEnd_1 <= timeCmp[1] + 2 && timeEnd_1 >= timeCmp[1] - 2 && timeEnd_0 === timeCmp[0]; // liegt die Zeit im Rahmen +-2 Sekunden von der Zielzeit?
	} catch (error) {
		console.error(`Time (active tab) Test error: ${error}`);
		return 999;
	}
}

async function timeInactiveTest(timeToWait: number = 22): Promise<number> {
	try {
		// Vorbereitung
		await startTest(driver, testPage);
		await switchToQuestion(driver, "K-Prim Choice");
		await sleep(3000);

		// Durchführung
		const timeLeftText = await driver.findElement(By.id("timeleft")).getText();
		Timer.start();
		const regex = /\d+/g;
		let timeStart = timeLeftText.match(regex);
		//logVar("Time start", timeStart);

		//Store the ID of the original window
		const originalWindow = await driver.getWindowHandle();

		// Opens a new tab and switches to new tab
		await driver.switchTo().newWindow("tab");

		// wait
		await sleep(timeToWait * 1000);

		//Close the tab or window
		await driver.close();

		//Switch back to the old tab or window
		await driver.switchTo().window(originalWindow);

		const actualTime = Timer.end();
		const timeNowText = await driver.findElement(By.id("timeleft")).getText();
		let timeEnd = timeNowText.match(regex);

		// Prüfung
		let timeCmp = [Number.parseInt(timeStart[0]) - Math.floor(actualTime / 60), Number.parseInt(timeStart[1]) - (actualTime % 60)];
		timeCmp[0] = timeCmp[1] < 0 ? timeCmp[0] - 1 : timeCmp[0];
		timeCmp[1] = timeCmp[1] < 0 ? timeCmp[1] + 60 : timeCmp[1];

		// logVar("Time cmp", timeCmp);
		// logVar("Time end", timeEnd);

		const timeEnd_0 = Number.parseInt(timeEnd[0]);
		const timeEnd_1 = Number.parseInt(timeEnd[1]);

		await endTest(driver);

		return timeEnd_0 === timeCmp[0] ? Math.abs(timeEnd_1 - timeCmp[1]) : 999; //Abweichung in der Zeit
		//return timeEnd_1 <= timeCmp[1] + 2 && timeEnd_1 >= timeCmp[1] - 2 && timeEnd_0 === timeCmp[0]; // liegt die Zeit im Rahmen +-2 Sekunden von der Zielzeit?
	} catch (error) {
		console.error(`Time (active tab) Test error: ${error}`);
		return 999;
	}
}

async function timeClosedTest(timeToWait: number = 22): Promise<number> {
	try {
		// Vorbereitung
		await startTest(driver, testPage);
		await switchToQuestion(driver, "K-Prim Choice");
		await sleep(3000);

		// Durchführung
		const timeLeftText = await driver.findElement(By.id("timeleft")).getText();
		Timer.start();
		const regex = /\d+/g;
		let timeStart = timeLeftText.match(regex);
		logVar("Time start", timeStart);

		// save url
		const url = await driver.getCurrentUrl();

		//Close the tab or window
		await driver.close();

		// wait
		await sleep(timeToWait * 1000);

		driver = await createDriver(options); // bot init
		await login(driver, loginPage); // login to ilias
		await startTest(driver, testPage);
		await switchToQuestion(driver, "K-Prim Choice");

		const actualTime = Timer.end();
		const timeNowText = await driver.findElement(By.id("timeleft")).getText();
		let timeEnd = timeNowText.match(regex);

		// Prüfung
		let timeCmp = [Number.parseInt(timeStart[0]) - Math.floor(actualTime / 60), Number.parseInt(timeStart[1]) - (actualTime % 60)];
		timeCmp[0] = timeCmp[1] < 0 ? timeCmp[0] - 1 : timeCmp[0];
		timeCmp[1] = timeCmp[1] < 0 ? timeCmp[1] + 60 : timeCmp[1];

		logVar("Timer seconds", actualTime);
		logVar("Time cmp", timeCmp);
		logVar("Time end", timeEnd);

		const timeEnd_0 = Number.parseInt(timeEnd[0]);
		const timeEnd_1 = Number.parseInt(timeEnd[1]);

		await endTest(driver);

		return timeEnd_0 === timeCmp[0] ? Math.abs(timeEnd_1 - timeCmp[1]) : 999; //Abweichung in der Zeit
		//return timeEnd_1 <= timeCmp[1] + 2 && timeEnd_1 >= timeCmp[1] - 2 && timeEnd_0 === timeCmp[0]; // liegt die Zeit im Rahmen +-2 Sekunden von der Zielzeit?
	} catch (error) {
		console.error(`Time (active tab) Test error: ${error}`);
		return 999;
	}
}
