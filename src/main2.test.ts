const gecko = require("geckodriver"); // firefox driver
import firefox from "selenium-webdriver/firefox"; // firefox-browser
import { Builder, By, Key, ThenableWebDriver, until, WebDriver } from "selenium-webdriver"; // selenium
import { test, expect, beforeAll, beforeEach, afterAll } from "@jest/globals"; // jest test-suite

const options = new firefox.Options(); // optional

const loginPage = "https://test7.ilias.de/login.php?target=root_1&client_id=test7&cmd=force_login&lang=de";
let testPage = "https://test7.ilias.de/ilias.php?ref_id=69540&cmd=infoScreen&cmdClass=ilobjtestgui&cmdNode=bc:um&baseClass=ilRepositoryGUI&ref_id=69540";

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
 		await driver.findElement(By.name("username")).sendKeys("psteib");
 		await driver.findElement(By.name("password")).sendKeys("gop1beouq", Key.RETURN);
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


async function openPage() {
	await driver.get(testPage);
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


//TEST LIST

test("Check correct availability", async () => {
	const result = await accessAndAvailabilityCorrect();
	expect(result).toBe("OK");
}, 20000);


test("Check incorrect access", async () => {
	const result = await accessOverAndAvailability();
	expect(result).toBe("FAIL");
}, 20000);


test("Check incorrect alloted time", async () => {
	const result = await testGivenTime();
	expect(result).toBe("TIME IS 2 MIN");
}, 50000);


test("Check incorrect number of users", async () => {
	const result = await testUsersAllowed();
	expect(result).toBe("INVALID");
}, 50000);


test("Check for doubled while adding", async () => {
	const result = await removeAndAddQuestions();
	expect(result).toBe("OK");
}, 20000);


test("Check unreal date input warning", async () => {
	const result = await unrealDateTest();
	expect(result).toBe("WARNING PRESENT");
}, 20000);


test("Check unreal date save", async () => {
	const result = await unrealDateTestSave();
	expect(result).toBe(legalEnd);
}, 20000);


test("Check marking save after resuming test", async () => {
	const result = await testStar();
	expect(result).toBe("OK");
}, 50000);


test("Check submission type", async () => {
	const result = await exerciseSubmissionType();
	expect(result).toBe("false");
}, 20000);


test("Check ancient date", async () => {
	const result = await ancientDateTest();
	expect(result).toBe("WARNING");
}, 20000);


test("Check ancient date save", async () => {
	const result = await ancientDateTestSave();
	expect(result).toBe(ancientDate);
}, 20000);


test("Check incorrect availibility", async () => {
	const result = await accessAndAvailabilityOver();
	expect(result).toBe("FAIL");
}, 20000);


test("Check negative manual score", async () => {
	const result = await manualScoring();
	expect(result).toBe("OK");
}, 50000);


test("Check arrowkeys", async () => {
	const result = await arrowKeyTest();
	expect(result).toBe("01.01.2030 22:00");
}, 20000);


//###########################
// BEGIN TEST SUB-FUNCTIONS #
//###########################
//

let legalStart = "01.01.2020 00:00";
let legalStartIncomplete = "01.01.2020 :00";
let illegalStart = "01.01.2030 00:00";
let legalEnd = "01.01.2030 00:00";
let legalEndIncomplete = "01.01.2030 :00";
let illegalEnd = "01.01.2020 00:00";
let ancientDate = "01.01.1234 00:00";
let unrealDate = "87.41.24 26:61";

let normalSleep = 3000;


async function accessAndAvailabilityCorrect() {
	let result = "FAIL";

	testPage = "https://test7.ilias.de/ilias.php?ref_id=69472&cmdClass=ilobjtestsettingsgeneralgui&cmdNode=bc:um:20&baseClass=ilRepositoryGUI";
	try{
		await openPage();
		await prepForLegalTest();

		await driver.findElement(By.id("tab_info_short")).click();	
		await sleep(normalSleep);
		await driver.findElement(By.name("cmd[startPlayer]"));

		result = "OK";

	}catch (err){
		console.error("Error: ", err);
	}finally{
	}
	return result;
}

async function accessOverAndAvailability() {
	let result = "FAIL";

	testPage = "https://test7.ilias.de/ilias.php?ref_id=69472&cmdClass=ilobjtestsettingsgeneralgui&cmdNode=bc:um:20&baseClass=ilRepositoryGUI";
	try{
		await openPage();
		await prepForLegalTest();

		//access
		await driver.findElement(By.id("starting_time")).clear()
		await driver.findElement(By.id("starting_time")).sendKeys(illegalStart, Key.RETURN);
		await driver.findElement(By.name("ending_time")).clear()
		await driver.findElement(By.name("ending_time")).sendKeys(illegalEnd, Key.RETURN);


		await driver.findElement(By.name("cmd[saveForm]")).click();
		await sleep(normalSleep);

		await driver.findElement(By.id("tab_info_short")).click();	
		await sleep(normalSleep);
		await driver.findElement(By.name("cmd[startPlayer]"));
		
		result = "OK";

	}catch (err){
		//console.error("Error: ", err);
	}finally{
	}
	return result;
}

async function accessAndAvailabilityOver() {
	let result = "FAIL";

	testPage = "https://test7.ilias.de/ilias.php?ref_id=69472&cmdClass=ilobjtestsettingsgeneralgui&cmdNode=bc:um:20&baseClass=ilRepositoryGUI";
	try{
		await openPage();
		await prepForLegalTest();

		//availability
		await driver.findElement(By.id("access_period[start]")).clear()
		await driver.findElement(By.id("access_period[start]")).sendKeys(illegalStart, Key.RETURN);
		await driver.findElement(By.name("access_period[end]")).clear()
		await driver.findElement(By.name("access_period[end]")).sendKeys(illegalEnd, Key.RETURN);

		await driver.findElement(By.name("cmd[saveForm]")).click();
		await sleep(normalSleep);

		await driver.findElement(By.id("tab_info_short")).click();	
		await sleep(normalSleep);
		await driver.findElement(By.name("cmd[startPlayer]"));
		
		result = "OK";

	}catch (err){
		//console.error("Error: ", err);
	}finally{
	}
	return result;
}

async function deleteResults() {
	let valueReturn = "NOTHING HAPPEND";
	try{
		//chage to results and delete
		//await sleep(normalSleep);
		await driver.findElement(By.id("tab_results")).click();
		await driver.findElement(By.linkText("Delete Test Data of all Users")).click();
		await driver.findElement(By.name("cmd[confirmDeleteAllUserResults]")).click();
		valueReturn = "DELETED";
	}catch (err){
		//console.error("Error: ", err);
	}finally{
		//await sleep(normalSleep);
		await driver.findElement(By.id("tab_settings")).click();
		//await sleep(normalSleep);
		return valueReturn;
	}
}

async function prepForLegalTest(){
	await deleteResults();
	
		//availability
		await driver.findElement(By.id("access_period[start]")).clear()
		await driver.findElement(By.id("access_period[start]")).sendKeys(legalStart, Key.RETURN);
		await driver.findElement(By.name("access_period[end]")).clear()
		await driver.findElement(By.name("access_period[end]")).sendKeys(legalEnd, Key.RETURN);

		//access
		await driver.findElement(By.id("starting_time")).clear()
		await driver.findElement(By.id("starting_time")).sendKeys(legalStart, Key.RETURN);
		await driver.findElement(By.name("ending_time")).clear()
		await driver.findElement(By.name("ending_time")).sendKeys(legalEnd, Key.RETURN);

		//legal numer of participants
		await sleep(normalSleep);
		await driver.findElement(By.id("allowedUsers")).clear();
		await driver.findElement(By.id("allowedUsers")).sendKeys("1", Key.RETURN);
		await driver.findElement(By.id("nr_of_tries")).clear();
		await driver.findElement(By.id("nr_of_tries")).sendKeys("1", Key.RETURN);

		await driver.findElement(By.name("cmd[saveForm]")).click();
		await sleep(normalSleep);

		return "ALL GOOD";

	}

	async function testGivenTime() {
		let result = "FAIL";

		testPage = "https://test7.ilias.de/ilias.php?ref_id=69472&cmdClass=ilobjtestsettingsgeneralgui&cmdNode=bc:um:20&baseClass=ilRepositoryGUI";
		try{
			await openPage();
			await prepForLegalTest();

		//availability
		await driver.findElement(By.id("access_period[start]")).clear()
		await driver.findElement(By.id("access_period[start]")).sendKeys(legalStart, Key.RETURN);
		await driver.findElement(By.name("access_period[end]")).clear()
		await driver.findElement(By.name("access_period[end]")).sendKeys(legalEnd, Key.RETURN);

		//access
		await driver.findElement(By.id("starting_time")).clear()
		await driver.findElement(By.id("starting_time")).sendKeys(legalStart, Key.RETURN);
		await driver.findElement(By.name("ending_time")).clear()
		await driver.findElement(By.name("ending_time")).sendKeys(legalEnd, Key.RETURN);

		//time
		await driver.findElement(By.id("processing_time")).clear();
		await driver.findElement(By.id("processing_time")).sendKeys("2", Key.RETURN);


		await driver.findElement(By.name("cmd[saveForm]")).click();
		await sleep(normalSleep);
		await driver.findElement(By.id("tab_info_short")).click();	
		await sleep(normalSleep);

		await driver.findElement(By.name("cmd[startPlayer]")).click();
		await sleep(normalSleep);
		await driver.findElement(By.xpath("//*[contains(text(),'You have 1 Minute')]"));
		
		result = "TIME IS 2 MIN";

	}catch (err){
		//console.error("Error: ", err);
	}finally{
	}
	return result;
}


async function testUsersAllowed() {
	let result = "FAIL";

	testPage = "https://test7.ilias.de/ilias.php?ref_id=69472&cmdClass=ilobjtestsettingsgeneralgui&cmdNode=bc:um:20&baseClass=ilRepositoryGUI";
	try{
		await openPage();
		await prepForLegalTest();

		await driver.findElement(By.id("allowedUsers")).clear();
		await driver.findElement(By.id("allowedUsers")).sendKeys("0", Key.RETURN);

		await driver.findElement(By.name("cmd[saveForm]")).click();
		await sleep(normalSleep);
		await driver.findElement(By.className("alert alert-danger"));
		result = "INVALID";

	}catch (err){
		//console.error("Error: ", err);
	}finally{
	}
	return result;
}


async function removeAndAddQuestions() {
	let result = "FAIL";

	testPage = "https://test7.ilias.de/ilias.php?ref_id=69472&cmdClass=ilobjtestsettingsgeneralgui&cmdNode=bc:um:20&baseClass=ilRepositoryGUI";
	try{
		await openPage();
		//await prepForLegalTest();

		await driver.findElement(By.id("tab_assQuestions")).click();

		try{
			await driver.findElement(By.xpath("//*[contains(text(),'Select All')]")).click();
			await driver.findElement(By.name("select_cmd")).click();
			await driver.findElement(By.name("cmd[confirmRemoveQuestions]")).click();
		}catch(err){
		}finally{
		}

		for (let i = 0; i < 2; i++) {
			try{
				await driver.findElement(By.xpath("//*[contains(text(),'Add from Pool')]")).click();
				await driver.findElement(By.xpath("//*[contains(text(),'Select All')]")).click();
				await driver.findElement(By.name("cmd[insertQuestions]")).click();
			}catch(err){
				return "OK"
			}finally{
			}
		}
		result = "NAH";
	}catch (err){
		//console.error("Error: ", err);
	}finally{
	}
	return result;
}

async function exerciseSubmissionType() {
	let result = "FAIL";

	testPage = "https://test7.ilias.de/ilias.php?ref_id=69625&ass_id=2335&cmd=listAssignments&cmdClass=ilexassignmenteditorgui&cmdNode=bc:13n:14g&baseClass=ilRepositoryGUI";
	try{
		await openPage();

		await driver.findElement(By.name("cmd[addAssignment]")).click();
		result = await driver.findElement(By.id("type")).getAttribute("disabled");
		await sleep(5000);
	
	}catch (err){
		//console.error("Error: ", err);
	}finally{
	}
	return result;
}


async function ancientDateTest() {
	let result = "FAIL";

	testPage = "https://test7.ilias.de/ilias.php?ref_id=69472&cmdClass=ilobjtestsettingsgeneralgui&cmdNode=bc:um:20&baseClass=ilRepositoryGUI";
	try{
		await openPage();
		await prepForLegalTest();

		//availability
		await driver.findElement(By.id("access_period[start]")).clear()
		await driver.findElement(By.id("access_period[start]")).sendKeys(ancientDate, Key.RETURN);
		await driver.findElement(By.name("access_period[end]")).clear()
		await driver.findElement(By.name("access_period[end]")).sendKeys(ancientDate, Key.RETURN);

		await driver.findElement(By.name("cmd[saveForm]")).click();
		await sleep(normalSleep);
		result = "NO WARNING";
		await driver.findElement(By.className("alert alert-danger"));
		result = "OK";

	}catch (err){
		//console.error("Error: ", err);
	}finally{
	}
	return result;
}


async function unrealDateTest() {
	let result = "FAIL";

	testPage = "https://test7.ilias.de/ilias.php?ref_id=69472&cmdClass=ilobjtestsettingsgeneralgui&cmdNode=bc:um:20&baseClass=ilRepositoryGUI";
	try{
		await openPage();
		await prepForLegalTest();

		//availability
		await driver.findElement(By.id("access_period[start]")).clear()
		await driver.findElement(By.id("access_period[start]")).sendKeys(unrealDate, Key.RETURN);
		await driver.findElement(By.name("access_period[end]")).clear()
		await driver.findElement(By.name("access_period[end]")).sendKeys(unrealDate, Key.RETURN);

		await driver.findElement(By.name("cmd[saveForm]")).click();

		await sleep(normalSleep);
		result = "NO WARNING";
		await driver.findElement(By.className("alert alert-danger"));
		result = "WARNING PRESENT";
	}catch (err){
		//console.error("Error: ", err);
	}finally{
	}
	return result;
}



async function unrealDateTestSave() {
	let result = "FAIL";

	testPage = "https://test7.ilias.de/ilias.php?ref_id=69472&cmdClass=ilobjtestsettingsgeneralgui&cmdNode=bc:um:20&baseClass=ilRepositoryGUI";
	try{
		await openPage();
		await prepForLegalTest();

		//availability
		await driver.findElement(By.id("access_period[start]")).clear()
		await driver.findElement(By.id("access_period[start]")).sendKeys(unrealDate, Key.RETURN);
		await driver.findElement(By.name("access_period[end]")).clear()
		await driver.findElement(By.name("access_period[end]")).sendKeys(unrealDate, Key.RETURN);

		await driver.findElement(By.name("cmd[saveForm]")).click();
		await sleep(normalSleep);

		await openPage();
		result = await driver.findElement(By.name("access_period[end]")).getAttribute("value");
	}catch (err){
		//console.error("Error: ", err);
	}finally{
	}
	return result;
}


async function ancientDateTestSave() {
	let result = "FAIL";

	testPage = "https://test7.ilias.de/ilias.php?ref_id=69472&cmdClass=ilobjtestsettingsgeneralgui&cmdNode=bc:um:20&baseClass=ilRepositoryGUI";
	try{
		await openPage();
		await prepForLegalTest();

		//availability
		await driver.findElement(By.id("access_period[start]")).clear()
		await driver.findElement(By.id("access_period[start]")).sendKeys(ancientDate, Key.RETURN);
		await driver.findElement(By.name("access_period[end]")).clear()
		await driver.findElement(By.name("access_period[end]")).sendKeys(ancientDate, Key.RETURN);

		await driver.findElement(By.name("cmd[saveForm]")).click();
		await sleep(normalSleep);

		await openPage();
		result = await driver.findElement(By.name("access_period[end]")).getAttribute("value");
	}catch (err){
		//console.error("Error: ", err);
	}finally{
	}
	return result;
}



//manual scoring

async function manualScoring() {
	let result = "FAIL";

	testPage = "https://test7.ilias.de/ilias.php?ref_id=69472&cmdClass=ilobjtestsettingsgeneralgui&cmdNode=bc:um:20&baseClass=ilRepositoryGUI";
	try{
		await openPage();
		await prepForLegalTest();

		await driver.findElement(By.id("tab_info_short")).click();
		await sleep(normalSleep);

		await driver.findElement(By.name("cmd[startPlayer]")).click();
		await sleep(normalSleep);
		await driver.findElement(By.linkText("Finish the Test")).click();
		await driver.findElement(By.id("tab_manscoring")).click();

		await driver.findElement(By.id("question")).sendKeys("so");
		await driver.findElement(By.name("cmd[applyManScoringByQuestionFilter]")).click();

		await driver.findElement(By.linkText("Show Answer")).click();
		//<input style="text-align:right;" class="form-control" type="text" size="5" id="scoring__0____14656____60062__" maxlength="200" name="scoring[0][14656][60062]" value="0">
		//await driver.findElement(By.linkText("0")).click();
		await driver.findElement(By.xpath('//*[text="0"')).clear();
		//await driver.findElement(By.xpath("//*[contains(text(),'0')]")).click();
		await sleep(normalSleep);
		await driver.findElement(By.className("form-control")).sendKeys("-100", Key.RETURN);
		await sleep(normalSleep);
		await driver.findElement(By.id("cmd[checkConstraintsBeforeSaving]")).click();
		
		await openPage();
		await sleep(normalSleep);
		await driver.findElement(By.id("tab_manscoring")).click();
		await sleep(normalSleep);
		
		//await driver.findElement(By.id("tab_info_short")).click();
	}catch (err){
		//console.error("Error: ", err);
	}finally{
	}
	return result;
}

async function testStar() {
let result = "FAIL";

	testPage = "https://test7.ilias.de/ilias.php?ref_id=69472&cmdClass=ilobjtestsettingsgeneralgui&cmdNode=bc:um:20&baseClass=ilRepositoryGUI";
	try{
		await openPage();
		await prepForLegalTest();

		await driver.findElement(By.id("tab_info_short")).click();
		await driver.findElement(By.name("cmd[startPlayer]")).click();
		await sleep(normalSleep);
		await driver.findElement(By.linkText("Actions")).click();
		await driver.findElement(By.linkText("Mark this question")).click();
		
		await openPage();
		await sleep(normalSleep);
		await driver.findElement(By.id("tab_info_short")).click();
		await sleep(normalSleep);
		await driver.findElement(By.name("cmd[resumePlayer]")).click();
		await sleep(normalSleep);
		await driver.findElement(By.linkText("Actions")).click();
		await sleep(normalSleep);
		await driver.findElement(By.linkText("Remove this mark")).click();
		result = "OK";
	}catch (err){
		//console.error("Error: ", err);
	}finally{
	}
	return result;	
}


async function arrowKeyTest() {
	let result = "FAIL";

	testPage = "https://test7.ilias.de/ilias.php?ref_id=69472&cmdClass=ilobjtestsettingsgeneralgui&cmdNode=bc:um:20&baseClass=ilRepositoryGUI";
	try{
		await openPage();
		await prepForLegalTest();

		//access
		await driver.findElement(By.id("starting_time")).clear()
		await driver.findElement(By.id("starting_time")).sendKeys(legalStart, Key.ARROW_LEFT, Key.ARROW_LEFT, Key.ARROW_LEFT, Key.BACK_SPACE, Key.BACK_SPACE, "22", Key.RETURN);
		await driver.findElement(By.name("ending_time")).clear()
		await driver.findElement(By.name("ending_time")).sendKeys(legalEnd, Key.ARROW_LEFT, Key.ARROW_LEFT, Key.ARROW_LEFT, Key.BACK_SPACE, Key.BACK_SPACE, "22", Key.RETURN);
		
		await driver.findElement(By.name("cmd[saveForm]")).click();
		await sleep(normalSleep);

		try{
			await driver.findElement(By.className("alert alert-danger"));
			return "WARNING";
		} catch (err) {

		}

		result = await driver.findElement(By.name("ending_time")).getAttribute("value");
	}catch (err){
		//console.error("Error: ", err);
	}finally{
	}
	return result;
}
