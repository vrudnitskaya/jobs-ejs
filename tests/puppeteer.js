const puppeteer = require("puppeteer");
require("../app");
const { seed_db, testUserPassword } = require("../util/seed_db");
const Job = require("../models/Job");

let testUser = null;
let page = null;
let browser = null;
let jobsCount = 0; 

describe("jobs-ejs puppeteer test", function () {
  before(async function () {
    this.timeout(10000);

    // dymanic import
    const chai = await import('chai');
    expect = chai.expect;

    //browser = await puppeteer.launch({ headless: false, slowMo: 100 });
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.goto("http://localhost:3000");
  });

  after(async function () {
    this.timeout(5000);
    await browser.close();
  });

  describe("got to site", function () {
    it("should have completed a connection", async function () { });
  });

  describe("index page test", function () {
    this.timeout(10000);
    it("finds the index page logon link", async () => {
      this.logonLink = await page.waitForSelector(
        "a ::-p-text(Click this link to logon)"
      );
    });
    it("gets to the logon page", async () => {
      await this.logonLink.click();
      await page.waitForNavigation();
      const email = await page.waitForSelector('input[name="email"]');
    });
  });

  describe("logon page test", function () {
    this.timeout(20000);
    it("resolves all the fields", async () => {
      this.email = await page.waitForSelector('input[name="email"]');
      this.password = await page.waitForSelector('input[name="password"]');
      this.submit = await page.waitForSelector("button ::-p-text(Logon)");
    });

    it("sends the logon", async () => {
      testUser = await seed_db();
      await this.email.type(testUser.email);
      await this.password.type(testUserPassword);
      await this.submit.click();
      await page.waitForNavigation();
      await page.waitForSelector(`p ::-p-text(${testUser.name} is logged on.)`);
      await page.waitForSelector("a ::-p-text(change the secret)");
      await page.waitForSelector('a[href="/secretWord"]');
      const copyr = await page.waitForSelector("p ::-p-text(copyright)");
      const copyrText = await copyr.evaluate((el) => el.textContent);
      console.log("copyright text: ", copyrText);
    });
  });

  describe("job operations", function () {
    this.timeout(10000);

    it("clicks on the jobs link and verifies the job listings page", async () => {
      const jobsLink = await page.waitForSelector("a[href='/jobs']");
      await jobsLink.click();
      await page.waitForNavigation();

      // Verify that the job listings page has loaded
      const heading = await page.waitForSelector("h2");
      const headText = await heading.evaluate((el) => el.textContent);
      console.log("heading text: ", headText);

      // Check that there are 20 entries in the jobs list
      const content = await page.content();
      jobsCount = content.split('<tr>').length - 1; 
      console.log("Number of job entries:", jobsCount);
      expect(jobsCount).to.equal(20); 
    });

    it("clicks on 'Add A Job' and verifies the form", async () => {
      try {
        const addJobLink = await page.waitForSelector("a[href='/jobs/new']", { timeout: 5000 });
        console.log("Add Job link found, clicking...");
        await addJobLink.click();

        // Wait for navigation to complete
        await page.waitForNavigation({ timeout: 5000 });
        console.log("Navigation to the 'Add a Job' form completed");

        // Verify the form heading
        const formHeading = await page.waitForSelector("h2", { timeout: 5000 });
        const formText = await formHeading.evaluate((el) => el.textContent);
        console.log("Form heading text: ", formText);
        expect(formText).to.equal("Add a New Job");

        // Resolve fields
        this.companyField = await page.waitForSelector('input[name="company"]', { timeout: 5000 });
        this.positionField = await page.waitForSelector('input[name="position"]', { timeout: 5000 });
        this.addButton = await page.waitForSelector("button[type='submit']", { timeout: 5000 });

        console.log("Form fields resolved");
      } catch (error) {
        console.error("Error in 'Add A Job' form test: ", error);
        throw error; 
      }
    });

    it("adds a new job and verifies the job list count increases", async () => {
      try {
        // Fill the form in
        await this.companyField.type("Microsoft");
        await this.positionField.type("frontend dev");
        await this.addButton.click();

        await page.waitForNavigation({ timeout: 10000, waitUntil: 'networkidle0' });

        // Get the number of the jobs
        const newJobsCount = await page.evaluate(() => {
          return document.querySelectorAll('#jobs-table tr:not(#jobs-table-header)').length; 
        });

        console.log("New jobs count:", newJobsCount); 

        expect(newJobsCount).to.equal(jobsCount + 1);
        jobsCount = newJobsCount; 
      } catch (error) {
        console.error("Error in adding a new job: ", error);
        throw error; 
      }
    });
  });
});