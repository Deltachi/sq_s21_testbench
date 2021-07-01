/**
 * Helpers Library geschrieben für die Testbench ILIAS
 * @author Dominik
 */

import firefox from "selenium-webdriver/firefox"; // firefox-browser
import { Builder, By, Key, ThenableWebDriver, until, WebDriver } from "selenium-webdriver"; // selenium
import { test, expect, beforeAll, beforeEach, afterAll } from "@jest/globals"; // jest test-suite

/**
 * "Fake" sleep function to stop skript for x ms.
 * @param {number} ms Milliseconds to sleep
 * @returns Promise for the timeout function - resolve
 */
export function sleep(ms: number) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

/**
 * Initializes the webdriver
 * @returns WebDriver
 */
export async function createDriver(options: firefox.Options): Promise<WebDriver> {
	return await new Builder().forBrowser("firefox").setFirefoxOptions(options).build();
}

/**
 * Attempts to login the driver with user credentials
 * @returns true if login was successfull
 */
export async function login(driver: WebDriver, loginPage: string): Promise<boolean> {
	try {
		await driver.get(loginPage);
		await driver.findElement(By.name("username")).sendKeys("Scheffler");
		await driver.findElement(By.name("password")).sendKeys("houazfn1", Key.RETURN);
		await driver.wait(until.elementLocated(By.className("abbreviation")), 5000);
	} catch {
		return false;
	} finally {
		return true;
	}
}

/**
 * Navigates the driver to the Test page and clicks the resume or start button
 */
export async function startTest(driver: WebDriver, testPage: string) {
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

export async function switchToQuestion(driver: WebDriver, linkText: string) {
	try {
		await driver.wait(until.elementsLocated(By.id("listofquestions")), 5000);
		await driver.findElement(By.id("listofquestions")).findElement(By.linkText(linkText)).click();
	} catch (error) {
		console.error("Switch to Question: " + error);
	}
}

export async function switchToOverview(driver: WebDriver) {
	try {
		await driver.findElement(By.linkText("Bearbeitungsstand")).click();
	} catch (error) {
		console.error("Switch to Overview: " + error);
	}
}

export async function deleteAnswer(driver: WebDriver, test: string = ""): Promise<boolean> {
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

export async function endTest(driver: WebDriver) {
	try {
		driver.findElement(By.linkText("Test beenden")).click();
		return true;
	} catch (error) {
		console.error(`End Test error: ${error}`);
		return false;
	}
}

export function logVar(name: string, input: any) {
	console.log(`${name}: ${input}`);
}
