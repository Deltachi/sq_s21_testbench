const gecko = require("geckodriver"); // firefox driver
import firefox from "selenium-webdriver/firefox"; // firefox-browser
import { Builder, By, Key, ThenableWebDriver, until, WebDriver } from "selenium-webdriver"; // selenium
import { test, expect, beforeAll, beforeEach, afterAll } from "@jest/globals"; // jest test-suite
import { createDriver, login, sleep, startTest, deleteAnswer, switchToQuestion, switchToOverview, logVar, endTest, Timer, PAGES } from "./helpers";

/** Global Variables Definition */
const options = new firefox.Options(); // optional
let driver: WebDriver; // web-crawling bot
const ELEMENT_WAIT_TIMEOUT = 5000;

/**
 * Vorbedingung für alle Tests
 */
beforeAll(async () => {
	driver = await createDriver(options); // bot init
	await login(driver, PAGES.loginPage); // login to ilias
}, 10000);

// beforeEach(async () => {
// });

/**
 * Teardown nach allen Tests
 */
afterAll(async () => {
	await sleep(2000);
	await driver.quit(); // Browser schließen, Prozess beenden
});

test("t_19: Fill Freeform, Save and Reload", async () => {
	const result = await fillFreeFormSaveReloadAndCheck("Hallo das ist ein Text, genereiert von Selenium!");
	expect(result).toBe("Hallo das ist ein Text, genereiert von Selenium!"); // failed, weil Speichern NICHT speichert
}, 20000);

test("t_20: Fill Freeform and Switch", async () => {
	const result = await fillFreeFormAndSwitch("Hallo das ist ein Text, genereiert von Selenium!");
	expect(result).toBe("Hallo das ist ein Text, genereiert von Selenium!"); // true, wenn speichert
}, 20000);

test("t_21: Fill Freeform, Wait and Reload", async () => {
	const result = await fillFreeFormAndWait("Hallo das ist ein Text, genereiert von Selenium!");
	expect(result).toBe("Hallo das ist ein Text, genereiert von Selenium!"); // true, wenn speichert
}, 45000);

test("t_22: Mark Words and Switch", async () => {
	const result = await markWordsAndSwitch();
	expect(result).toBeTruthy(); // sollte wahr sein, wenn die Eingabe gespeichert wird
}, 20000);

test("t_23: Mark Words and Wait", async () => {
	const result = await markWordsAndWait();
	expect(result).toBeTruthy(); // sollte wahr sein, wenn die Eingabe gespeichert wird
}, 45000);

test("t_24: K-Prim and Switch", async () => {
	const result = await kPrimAndSwitch();
	expect(result).toBeTruthy(); // sollte wahr sein, wenn die Eingabe gespeichert wird
}, 20000);

test("t_25: K-Prim and Wait", async () => {
	const result = await kPrimAndWait();
	expect(result).toBeTruthy(); // sollte wahr sein, wenn die Eingabe gespeichert wird
}, 45000);

test("t_26: Begriffe and Switch", async () => {
	const result = await begriffeAndSwitch();
	expect(result).toBeTruthy(); // sollte wahr sein, wenn die Eingabe gespeichert wird
}, 20000);

test("t_27: Begriffe and Wait", async () => {
	const result = await begriffeAndWait();
	expect(result).toBeTruthy(); // sollte wahr sein, wenn die Eingabe gespeichert wird
}, 45000);

test("t_28: Lückentext and Switch", async () => {
	const result = await lueckentextAndSwitch("Lückentext");
	expect(result).toBe("Lückentext"); // sollte wahr sein, wenn die Eingabe gespeichert wird
}, 20000);

test("t_29: Lückentext and Wait", async () => {
	const result = await lueckentextAndWait("Lückentext");
	expect(result).toBe("Lückentext"); // sollte wahr sein, wenn die Eingabe gespeichert wird
}, 45000);

test("t_30: Multiple Choice and Switch", async () => {
	const result = await multipleChoiceAndSwitch();
	expect(result).toBeTruthy(); // sollte wahr sein, wenn die Auswahl gespeichert wird
}, 20000);

test("t_31: Multiple Choice and Wait", async () => {
	const result = await multipleChoiceAndWait();
	expect(result).toBeTruthy(); // sollte wahr sein, wenn die Auswahl gespeichert wird
}, 45000);

test("t_32: Single Choice and Switch", async () => {
	const result = await singleChoiceAndSwitch();
	expect(result).toBeTruthy(); // sollte wahr sein, wenn die Auswahl gespeichert wird
}, 20000);

test("t_33: Single Choice and Wait", async () => {
	const result = await singleChoiceAndWait();
	expect(result).toBeTruthy(); // sollte wahr sein, wenn die Auswahl gespeichert wird
}, 45000);

test("t_34: Numerische Frage and Switch", async () => {
	const result = await numericInputAndSwitch(42);
	expect(result).toBe(42); // sollte wahr sein, wenn die Eingabe gespeichert wird
}, 20000);

test("t_35: Numerische Frage and Wait", async () => {
	const result = await numericInputAndWait(42);
	expect(result).toBe(42); // sollte wahr sein, wenn die Eingabe gespeichert wird
}, 45000);

test("t_2_0: G1 - Erreiche < 50% im Test und falle durch", async () => {
	const result = await failAt49Percent();
	expect(result).toBeTruthy(); // sollte wahr sein, wenn nicht bestanden wurde
}, 110000);

test("t_2_1: G2 - Erreiche >= 50% im Test und bestehe", async () => {
	const result = await pass50Percent();
	expect(result).toBeTruthy(); // sollte wahr sein, wenn bestanden wurde
}, 110000);

test("t_16: Time (active tab) Test", async () => {
	const result = await timeActiveTest(10);
	expect(result).toBeLessThan(3); // Die Abweichung sollte weniger als 3 Sekunden sein
}, 100000); // max 100 sec Test

test("t_17: Time (inactive tab) Test", async () => {
	const result = await timeInactiveTest(10);
	expect(result).toBeLessThan(3); // Die Abweichung sollte weniger als 3 Sekunden sein
}, 150000); // max 150 sec Test

test("t_18: Time (closed tab) Test", async () => {
	const result = await timeClosedTest(10);
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
		await startTest(driver, PAGES.testPage);

		await switchToQuestion(driver, "Freitext");

		await driver.wait(until.elementsLocated(By.css("iframe.tox-edit-area__iframe")), ELEMENT_WAIT_TIMEOUT);

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

/**
 * Fügt Text in ein Freitextfeld ein, wechselt die Aufgabe und lädt die Seite neu
 * @param text Testtext welcher eingefügt werden soll
 * @returns Text innerhalb des Editors nach dem Test
 */
async function fillFreeFormAndSwitch(text: string) {
	let result = null;
	try {
		await startTest(driver, PAGES.testPage);

		await switchToQuestion(driver, "Freitext");

		await driver.wait(until.elementsLocated(By.css("iframe.tox-edit-area__iframe")), ELEMENT_WAIT_TIMEOUT);

		await deleteAnswer(driver);

		await driver.switchTo().frame(driver.findElement(By.css("iframe.tox-edit-area__iframe"))); // switch to iframe to input into tiny-mce editor

		await driver.findElement(By.css(".mce-content-body")).sendKeys(text);

		await driver.switchTo().defaultContent(); // switch back to normal content

		await sleep(500);
		await driver.findElement(By.linkText("Bearbeitungsstand")).click();

		await switchToQuestion(driver, "Freitext");
		await sleep(500);

		await driver.wait(until.elementsLocated(By.css("iframe.tox-edit-area__iframe")), ELEMENT_WAIT_TIMEOUT);
		await driver.switchTo().frame(driver.findElement(By.css("iframe.tox-edit-area__iframe"))); // switch to iframe
		result = await driver.findElement(By.css(".mce-content-body p")).getText();

		await driver.switchTo().defaultContent(); // switch back to normal content
	} catch (err) {
		console.error("Error: ", err);
	} finally {
	}
	return result;
}

/**
 * Fügt Text in ein Freitextfeld ein, wartet und prüft die Datenkonsistenz
 * @param text Testtext welcher eingefügt werden soll
 * @returns Text innerhalb des Editors nach dem Test
 */
async function fillFreeFormAndWait(text: string) {
	let result = null;
	try {
		await startTest(driver, PAGES.testPage);

		await switchToQuestion(driver, "Freitext");

		await driver.wait(until.elementsLocated(By.css("iframe.tox-edit-area__iframe")), ELEMENT_WAIT_TIMEOUT);

		await deleteAnswer(driver);

		await driver.switchTo().frame(driver.findElement(By.css("iframe.tox-edit-area__iframe"))); // switch to iframe to input into tiny-mce editor

		await driver.findElement(By.css(".mce-content-body")).sendKeys(text);

		await driver.switchTo().defaultContent(); // switch back to normal content

		await sleep(30000);
		// Seite neuladen
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

/**
 * Markiert Wörter, wechselt die Aufgabe und prüft die Datenkonsistenz
 * @returns Wahr wenn Daten konsistent waren
 */
async function markWordsAndSwitch(): Promise<boolean> {
	try {
		// Vorbedingung
		await startTest(driver, PAGES.testPage);
		await switchToQuestion(driver, "Worte markieren");
		await driver.wait(until.elementsLocated(By.linkText("falsch")), ELEMENT_WAIT_TIMEOUT);

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
		await driver.wait(until.elementsLocated(By.linkText("falsch")), ELEMENT_WAIT_TIMEOUT);

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

/**
 * Markiert Wörter, wartet 30sec und prüft die Datenkonsistenz
 * @returns Wahr wenn Daten konsistent waren
 */
async function markWordsAndWait(): Promise<boolean> {
	try {
		// Vorbedingung
		await startTest(driver, PAGES.testPage);
		await switchToQuestion(driver, "Worte markieren");
		await driver.wait(until.elementsLocated(By.linkText("falsch")), ELEMENT_WAIT_TIMEOUT);

		await deleteAnswer(driver);

		// Durchführung
		await (
			await driver.findElements(By.linkText("falsch"))
		).forEach(async (element) => {
			await element.click();
		});
		await sleep(30000);
		// Seite neuladen
		await driver.navigate().refresh();
		await driver.wait(until.elementsLocated(By.linkText("falsch")), ELEMENT_WAIT_TIMEOUT);

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

/**
 * Löst Aufgabe, wechselt zur nächsten und zurück, prüft dann auf Konsistenz
 * @returns Wahr wenn Daten konsistent waren
 */
async function kPrimAndSwitch(): Promise<boolean> {
	let radios: Array<boolean> = [];
	try {
		// Vorbereitung
		await startTest(driver, PAGES.testPage);
		await switchToQuestion(driver, "K-Prim Choice");
		await driver.wait(until.elementsLocated(By.xpath("//input[@id='0']")), ELEMENT_WAIT_TIMEOUT);
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
		await driver.wait(until.elementsLocated(By.xpath("//input[@id='0']")), ELEMENT_WAIT_TIMEOUT);
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

/**
 * Löst Aufgabe, wartet, prüft dann auf Konsistenz
 * @returns Wahr wenn Daten konsistent waren
 */
async function kPrimAndWait(): Promise<boolean> {
	let radios: Array<boolean> = [];
	try {
		// Vorbereitung
		await startTest(driver, PAGES.testPage);
		await switchToQuestion(driver, "K-Prim Choice");
		await driver.wait(until.elementsLocated(By.xpath("//input[@id='0']")), ELEMENT_WAIT_TIMEOUT);
		await sleep(500);

		await deleteAnswer(driver);

		await sleep(500);

		// Durchführung
		// Musterlösung
		await driver.findElement(By.xpath("//input[@id='0']")).click();
		await driver.findElement(By.xpath("(//input[@id='1'])[2]")).click();
		await driver.findElement(By.xpath("//input[@id='2']")).click();
		await driver.findElement(By.xpath("(//input[@id='3'])[2]")).click();

		await sleep(30000);
		// Seite neuladen
		await driver.navigate().refresh();
		await driver.wait(until.elementsLocated(By.xpath("//input[@id='0']")), ELEMENT_WAIT_TIMEOUT); // auf Element warten
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

/**
 * Trägt Begriffe ein, wechselt die Aufgabe, prüft auf Konsistenz
 * @returns Wahr wenn Daten konsistent waren
 */
async function begriffeAndSwitch(): Promise<boolean> {
	let answers: Array<string> = [];
	try {
		// Vorbedingung
		await startTest(driver, PAGES.testPage);
		await switchToQuestion(driver, "Begriffe");
		await driver.wait(until.elementsLocated(By.name("TEXTSUBSET_01")), ELEMENT_WAIT_TIMEOUT);
		await sleep(500);

		await deleteAnswer(driver);

		await sleep(500);

		// Durchführung
		await driver.findElement(By.name("TEXTSUBSET_01")).sendKeys("Antwort 1");
		await driver.findElement(By.name("TEXTSUBSET_02")).sendKeys("Antwort 2");

		await sleep(2000);

		await switchToOverview(driver);
		await switchToQuestion(driver, "Begriffe");
		await driver.wait(until.elementsLocated(By.name("TEXTSUBSET_01")), ELEMENT_WAIT_TIMEOUT);
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

/**
 * Trägt Begriffe ein, wartet, prüft auf Konsistenz
 * @returns Wahr wenn Daten konsistent waren
 */
async function begriffeAndWait(): Promise<boolean> {
	let answers: Array<string> = [];
	try {
		// Vorbedingung
		await startTest(driver, PAGES.testPage);
		await switchToQuestion(driver, "Begriffe");
		await driver.wait(until.elementsLocated(By.name("TEXTSUBSET_01")), ELEMENT_WAIT_TIMEOUT);
		await sleep(500);

		await deleteAnswer(driver);

		await sleep(500);

		// Durchführung
		await driver.findElement(By.name("TEXTSUBSET_01")).sendKeys("Antwort 1");
		await driver.findElement(By.name("TEXTSUBSET_02")).sendKeys("Antwort 2");

		// warten um Autosave zu triggern
		await sleep(30000);
		// Seite neuladen
		await driver.navigate().refresh();
		await driver.wait(until.elementsLocated(By.name("TEXTSUBSET_01")), ELEMENT_WAIT_TIMEOUT);
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

/**
 * Trägt Begriffe ein, wechselt die Aufgabe, prüft auf Konsistenz
 * @returns Wahr wenn Daten konsistent waren
 */
async function lueckentextAndSwitch(input: string): Promise<string> {
	let answer: string = "";
	try {
		// Vorbedingung
		await startTest(driver, PAGES.testPage);
		await switchToQuestion(driver, "Lückentext");
		await driver.wait(until.elementsLocated(By.name("gap_0")), ELEMENT_WAIT_TIMEOUT);
		await sleep(500);

		await deleteAnswer(driver);

		await sleep(500);

		// Durchführung
		await driver.findElement(By.name("gap_0")).sendKeys(input);

		await sleep(2000);

		await switchToOverview(driver);
		await switchToQuestion(driver, "Lückentext");
		await driver.wait(until.elementsLocated(By.name("gap_0")), ELEMENT_WAIT_TIMEOUT);
		await sleep(500);

		// Prüfung
		answer = await driver.findElement(By.name("gap_0")).getAttribute("value");

		return answer;
	} catch (error) {
		console.error("Lückentext-Error: " + error);
		return null;
	}
}

/**
 * Trägt Begriffe ein, wartet, prüft auf Konsistenz
 * @returns Wahr wenn Daten konsistent waren
 */
async function lueckentextAndWait(input: string): Promise<string> {
	let answer: string = "";
	try {
		// Vorbedingung
		await startTest(driver, PAGES.testPage);
		await switchToQuestion(driver, "Lückentext");
		await driver.wait(until.elementsLocated(By.name("gap_0")), ELEMENT_WAIT_TIMEOUT);
		await sleep(500);

		await deleteAnswer(driver);

		await sleep(500);

		// Durchführung
		await driver.findElement(By.name("gap_0")).sendKeys(input);

		// warten um Autosave zu triggern
		await sleep(30000);
		// Seite neuladen
		await driver.navigate().refresh();
		await driver.wait(until.elementsLocated(By.name("gap_0")), ELEMENT_WAIT_TIMEOUT);
		await sleep(500);

		// Prüfung
		answer = await driver.findElement(By.name("gap_0")).getAttribute("value");

		return answer;
	} catch (error) {
		console.error("Lückentext-Error: " + error);
		return null;
	}
}

/**
 * Wählt Begriffe aus, wechselt die Aufgabe, prüft auf Konsistenz
 * @returns Wahr wenn Daten konsistent waren
 */
async function multipleChoiceAndSwitch(): Promise<boolean> {
	let answers: Array<boolean> = [];
	try {
		// Vorbedingung
		await startTest(driver, PAGES.testPage);
		await switchToQuestion(driver, "Multiple Choice");
		await driver.wait(until.elementsLocated(By.id("answer_0")), ELEMENT_WAIT_TIMEOUT);
		await sleep(500);

		await deleteAnswer(driver);

		await sleep(500);

		// Durchführung
		await driver.findElement(By.id("answer_0")).click();
		await driver.findElement(By.id("answer_2")).click();

		await sleep(2000);

		await switchToOverview(driver);
		await switchToQuestion(driver, "Multiple Choice");
		await driver.wait(until.elementsLocated(By.id("answer_0")), ELEMENT_WAIT_TIMEOUT);
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

/**
 * Wählt Begriffe aus, wartet, prüft auf Konsistenz
 * @returns Wahr wenn Daten konsistent waren
 */
async function multipleChoiceAndWait(): Promise<boolean> {
	let answers: Array<boolean> = [];
	try {
		// Vorbedingung
		await startTest(driver, PAGES.testPage);
		await switchToQuestion(driver, "Multiple Choice");
		await driver.wait(until.elementsLocated(By.id("answer_0")), ELEMENT_WAIT_TIMEOUT);
		await sleep(500);

		await deleteAnswer(driver);

		await sleep(500);

		// Durchführung
		await driver.findElement(By.id("answer_0")).click();
		await driver.findElement(By.id("answer_2")).click();

		// warten um Autosave zu triggern
		await sleep(30000);
		// Seite neuladen
		await driver.navigate().refresh();
		await driver.wait(until.elementsLocated(By.id("answer_0")), ELEMENT_WAIT_TIMEOUT);
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

/**
 * Wählt Antwort aus, wechselt die Aufgabe, prüft auf Konsistenz
 * @returns Wahr wenn Daten konsistent waren
 */
async function singleChoiceAndSwitch(): Promise<boolean> {
	let answers: Array<boolean> = [];
	try {
		// Vorbedingung
		await startTest(driver, PAGES.testPage);
		await switchToQuestion(driver, "Single Choice");
		await driver.wait(until.elementsLocated(By.id("answer_0")), ELEMENT_WAIT_TIMEOUT);
		await sleep(500);

		await deleteAnswer(driver);

		await sleep(500);

		// Durchführung
		await driver.findElement(By.id("answer_0")).click();

		await sleep(2000);

		await switchToOverview(driver);
		await switchToQuestion(driver, "Single Choice");
		await driver.wait(until.elementsLocated(By.id("answer_0")), ELEMENT_WAIT_TIMEOUT);
		await sleep(500);

		// Prüfung
		answers[0] = await driver.findElement(By.id("answer_0")).isSelected();

		return !!answers[0];
	} catch (error) {
		console.error("Single Choice-Error: " + error);
		return false;
	}
}

/**
 * Wählt Antwort aus, wartet, prüft auf Konsistenz
 * @returns Wahr wenn Daten konsistent waren
 */
async function singleChoiceAndWait(): Promise<boolean> {
	let answers: Array<boolean> = [];
	try {
		// Vorbedingung
		await startTest(driver, PAGES.testPage);
		await switchToQuestion(driver, "Single Choice");
		await driver.wait(until.elementsLocated(By.id("answer_0")), ELEMENT_WAIT_TIMEOUT);
		await sleep(500);

		await deleteAnswer(driver);

		await sleep(500);

		// Durchführung
		await driver.findElement(By.id("answer_0")).click();

		// warten um Autosave zu triggern
		await sleep(30000);
		// Seite neuladen
		await driver.navigate().refresh();
		await driver.wait(until.elementsLocated(By.id("answer_0")), ELEMENT_WAIT_TIMEOUT);
		await sleep(500);

		// Prüfung
		answers[0] = await driver.findElement(By.id("answer_0")).isSelected();

		return !!answers[0];
	} catch (error) {
		console.error("Single Choice-Error: " + error);
		return false;
	}
}

/**
 * Trägt Antwort ein, wechselt die Aufgabe, prüft auf Konsistenz
 * @returns Wahr wenn Daten konsistent waren
 */
async function numericInputAndSwitch(input: number): Promise<number> {
	let answer: number;
	try {
		// Vorbedingung
		await startTest(driver, PAGES.testPage);
		await switchToQuestion(driver, "Numerische Frage");
		await driver.wait(until.elementsLocated(By.name("numeric_result")), ELEMENT_WAIT_TIMEOUT);
		await sleep(500);

		await deleteAnswer(driver);

		await sleep(500);

		// Durchführung
		await driver.findElement(By.name("numeric_result")).sendKeys(input);

		await sleep(2000);

		await switchToOverview(driver);
		await switchToQuestion(driver, "Numerische Frage");
		await driver.wait(until.elementsLocated(By.name("numeric_result")), ELEMENT_WAIT_TIMEOUT);
		await sleep(500);

		// Prüfung
		answer = Number.parseInt(await driver.findElement(By.name("numeric_result")).getAttribute("value"));

		return answer;
	} catch (error) {
		console.error("Numerische Frage-Error: " + error);
		return null;
	}
}

/**
 * Trägt Antwort ein, wartet, prüft auf Konsistenz
 * @returns Wahr wenn Daten konsistent waren
 */
async function numericInputAndWait(input: number): Promise<number> {
	let answer: number;
	try {
		// Vorbedingung
		await startTest(driver, PAGES.testPage);
		await switchToQuestion(driver, "Numerische Frage");
		await driver.wait(until.elementsLocated(By.name("numeric_result")), ELEMENT_WAIT_TIMEOUT);
		await sleep(500);

		await deleteAnswer(driver);

		await sleep(500);

		// Durchführung
		await driver.findElement(By.name("numeric_result")).sendKeys(input);

		// warten um Autosave zu triggern
		await sleep(30000);
		// Seite neuladen
		await driver.navigate().refresh();
		await driver.wait(until.elementsLocated(By.name("numeric_result")), ELEMENT_WAIT_TIMEOUT);
		await sleep(500);

		// Prüfung
		answer = Number.parseInt(await driver.findElement(By.name("numeric_result")).getAttribute("value"));

		return answer;
	} catch (error) {
		console.error("Numerische Frage-Error: " + error);
		return null;
	}
}

/**
 * Löst einen Test mit einem Punkt unterhalb der Bestehensgrenze, prüft ob nicht bestanden wurde
 * @returns Wahr, wenn Test tatsächlich nicht bestnanden wurde (bei < 50%)
 */
async function failAt49Percent(): Promise<boolean> {
	try {
		//Vorbedingung
		await startTest(driver, PAGES.testPage);

		// Durchführung - Beantworte 2 Fragen nicht (resultiert in 19/39 Punkte gesamt)
		await switchToQuestion(driver, "Single Choice");
		await driver.wait(until.elementsLocated(By.id("answer_0")), ELEMENT_WAIT_TIMEOUT);
		await sleep(500);

		await deleteAnswer(driver);

		await sleep(500);

		await switchToOverview(driver);
		await switchToQuestion(driver, "Lückentext");
		await driver.wait(until.elementsLocated(By.name("gap_0")), ELEMENT_WAIT_TIMEOUT);
		await sleep(500);

		await deleteAnswer(driver);

		await sleep(500);

		await markWordsAndSwitch();
		await kPrimAndSwitch();
		await begriffeAndSwitch();
		//await lueckentextAndSwitch("Lückentext"); // - 5p
		await multipleChoiceAndSwitch();
		//await singleChoiceAndSwitch();	// - 5p
		await numericInputAndSwitch(42);

		// Prüfung
		await endTest(driver);
		//await driver.get(resultPage);
		await driver.wait(until.elementsLocated(By.xpath('//*[@id="mainscrolldiv"]/div[3]/div[2]/div')), ELEMENT_WAIT_TIMEOUT);
		const result = await driver.findElement(By.xpath('//*[@id="mainscrolldiv"]/div[3]/div[2]/div')).getText();
		return result.indexOf("nicht bestanden") >= 0; //falle durch wenn "nicht bestanden" im alert steht
	} catch (error) {
		console.error(`49% Test error: ${error}`);
		return null;
	}
}

/**
 * Löst einen Test mit einem Punkt oberhalb der Bestehensgrenze, prüft ob bestanden wurde
 * @returns Wahr, wenn Test tatsächlich bestnanden wurde (bei >= 50%)
 */
async function pass50Percent(): Promise<boolean> {
	try {
		//Vorbedingung
		await startTest(driver, PAGES.testPage);

		// Durchführung - Beantworte 2 Fragen nicht (resultiert in 20/39 Punkte gesamt)
		await switchToQuestion(driver, "Single Choice");
		await driver.wait(until.elementsLocated(By.id("answer_0")), ELEMENT_WAIT_TIMEOUT);
		await sleep(500);

		await deleteAnswer(driver);

		await sleep(500);

		await switchToOverview(driver);
		await switchToQuestion(driver, "K-Prim Choice");
		await driver.wait(until.elementsLocated(By.xpath("//input[@id='0']")), ELEMENT_WAIT_TIMEOUT);
		await sleep(500);

		await deleteAnswer(driver);

		await sleep(500);

		await markWordsAndSwitch();
		//await kPrimAndSwitch();	// - 4p
		await begriffeAndSwitch();
		await lueckentextAndSwitch("Lückentext");
		await multipleChoiceAndSwitch();
		//await singleChoiceAndSwitch();	// - 5p
		await numericInputAndSwitch(42);

		// Prüfung
		await endTest(driver);
		//await driver.get(resultPage);
		await driver.wait(until.elementsLocated(By.xpath('//*[@id="mainscrolldiv"]/div[3]/div[2]/div')), ELEMENT_WAIT_TIMEOUT);
		const result = await driver.findElement(By.xpath('//*[@id="mainscrolldiv"]/div[3]/div[2]/div')).getText();
		return result.indexOf("nicht bestanden") < 0; //falle nicht durch wenn nicht "nicht bestanden" im alert steht
	} catch (error) {
		console.error(`50% Test error: ${error}`);
		return null;
	}
}

/**
 * Öffnet einen Test und wartet eine Zeit x und prüft, ob der Timer die korrekte Zeit anzeigt
 * @param secondsToWait Wartezeit, welche es zu prüfen gilt
 * @returns Wahr wenn Zeit mit dem Timer übereinstimmt
 */
async function timeActiveTest(secondsToWait: number = 22): Promise<number> {
	try {
		// Vorbereitung
		await startTest(driver, PAGES.testPage);
		await switchToQuestion(driver, "K-Prim Choice");
		await sleep(3000);

		// Durchführung
		const timeLeftText = await driver.findElement(By.id("timeleft")).getText();
		Timer.start();

		const regex = /\d+/g;
		let timeStart = timeLeftText.match(regex);
		//logVar("Time start", timeStart);
		await sleep(secondsToWait * 1000);

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
		await sleep(3000);

		return timeEnd_0 === timeCmp[0] ? Math.abs(timeEnd_1 - timeCmp[1]) : 999; //Abweichung in der Zeit
		//return timeEnd_1 <= timeCmp[1] + 2 && timeEnd_1 >= timeCmp[1] - 2 && timeEnd_0 === timeCmp[0]; // liegt die Zeit im Rahmen +-2 Sekunden von der Zielzeit?
	} catch (error) {
		console.error(`Time (active tab) Test error: ${error}`);
		return 999;
	}
}

/**
 * Öffnet einen Test, wechselt im Browser zu einem anderen Tab und wartet eine Zeit x und prüft, ob der Timer die korrekte Zeit anzeigt
 * @param secondsToWait Wartezeit, welche es zu prüfen gilt
 * @returns Wahr wenn Zeit mit dem Timer übereinstimmt
 */
async function timeInactiveTest(secondsToWait: number = 22): Promise<number> {
	try {
		// Vorbereitung
		await startTest(driver, PAGES.testPage);
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
		await sleep(secondsToWait * 1000);

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

		await sleep(2000);
		await endTest(driver);
		await sleep(2000);

		return timeEnd_0 === timeCmp[0] ? Math.abs(timeEnd_1 - timeCmp[1]) : 999; //Abweichung in der Zeit
		//return timeEnd_1 <= timeCmp[1] + 2 && timeEnd_1 >= timeCmp[1] - 2 && timeEnd_0 === timeCmp[0]; // liegt die Zeit im Rahmen +-2 Sekunden von der Zielzeit?
	} catch (error) {
		console.error(`Time (active tab) Test error: ${error}`);
		return 999;
	}
}

/**
 * Öffnet einen Test, schließt den Browser und wartet eine Zeit x und prüft, ob der Timer die korrekte Zeit anzeigt
 * @param secondsToWait Wartezeit, welche es zu prüfen gilt
 * @returns Wahr wenn Zeit mit dem Timer übereinstimmt
 */
async function timeClosedTest(secondsToWait: number = 22): Promise<number> {
	try {
		// Vorbereitung
		await startTest(driver, PAGES.testPage);
		await switchToQuestion(driver, "K-Prim Choice");
		await sleep(3000);

		// Durchführung
		const timeLeftText = await driver.findElement(By.id("timeleft")).getText();
		Timer.start();
		const regex = /\d+/g;
		let timeStart = timeLeftText.match(regex);
		// logVar("Time start", timeStart);

		// save url
		const url = await driver.getCurrentUrl();

		//Close the tab or window
		await driver.close();

		// wait
		await sleep(secondsToWait * 1000);

		driver = await createDriver(options); // bot init
		await login(driver, PAGES.loginPage); // login to ilias
		await startTest(driver, PAGES.testPage);
		await switchToQuestion(driver, "K-Prim Choice");

		const actualTime = Timer.end();
		const timeNowText = await driver.findElement(By.id("timeleft")).getText();
		let timeEnd = timeNowText.match(regex);

		// Prüfung
		let timeCmp = [Number.parseInt(timeStart[0]) - Math.floor(actualTime / 60), Number.parseInt(timeStart[1]) - (actualTime % 60)];
		timeCmp[0] = timeCmp[1] < 0 ? timeCmp[0] - 1 : timeCmp[0];
		timeCmp[1] = timeCmp[1] < 0 ? timeCmp[1] + 60 : timeCmp[1];

		// logVar("Timer seconds", actualTime);
		// logVar("Time cmp", timeCmp);
		// logVar("Time end", timeEnd);

		const timeEnd_0 = Number.parseInt(timeEnd[0]);
		const timeEnd_1 = Number.parseInt(timeEnd[1]);

		await sleep(2000);
		await endTest(driver);
		await sleep(2000);

		return timeEnd_0 === timeCmp[0] ? Math.abs(timeEnd_1 - timeCmp[1]) : 999; //Abweichung in der Zeit
		//return timeEnd_1 <= timeCmp[1] + 2 && timeEnd_1 >= timeCmp[1] - 2 && timeEnd_0 === timeCmp[0]; // liegt die Zeit im Rahmen +-2 Sekunden von der Zielzeit?
	} catch (error) {
		console.error(`Time (active tab) Test error: ${error}`);
		return 999;
	}
}
