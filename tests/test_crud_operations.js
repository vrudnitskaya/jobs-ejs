const Job = require("../models/Job");
const { seed_db, testUserPassword } = require("../util/seed_db");
const { app } = require("../app");

const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
const { expect } = chai;

const { default: factory } = require("factory-bot");

describe("test jobs CRUD", function () {
  before(async () => {
    this.test_user = await seed_db();
    let res = await chai.request(app).get("/sessions/logon").send(); 
    const textNoLineEnd = res.text.replaceAll("\n", "");
    this.csrfToken = /_csrf\" value=\"(.*?)\"/.exec(textNoLineEnd)[1];
    let cookies = res.headers["set-cookie"];
    this.csrfCookie = cookies.find((element) => element.startsWith("csrfToken"));

    const dataToPost = {
      email: this.test_user.email,
      password: testUserPassword,
      _csrf: this.csrfToken,
    };

    const response = await chai
      .request(app)
      .post("/sessions/logon")
      .set("Cookie", this.csrfCookie)
      .set("content-type", "application/x-www-form-urlencoded")
      .redirects(0)
      .send(dataToPost);

    expect(response).to.have.status(302);
    expect(response.headers.location).to.equal('/');
    cookies = response.headers["set-cookie"];
    this.sessionCookie = cookies.find((element) =>
      element.startsWith("connect.sid")
    );

    expect(this.csrfToken).to.not.be.undefined;
    expect(this.sessionCookie).to.not.be.undefined;
    expect(this.csrfCookie).to.not.be.undefined;
  });

  it("should get the jobs list", async () => {
    const res = await chai
      .request(app)
      .get("/jobs")
      .set("Cookie", this.sessionCookie)
      .send();

    expect(res).to.have.status(200);
    expect(res.text).to.not.be.empty;
    const pageParts = res.text.split("<tr>");
    expect(pageParts.length).to.equal(21); 
});

it("should post a new job", async () => {
  this.job= await factory.build("job", { createdBy: this.test_user._id });
  const dataToPost = {
    company: this.job.company,
    position: this.job.position,
    status: this.job.status,
    _csrf: this.csrfToken,
  };
  
  const res = await chai
      .request(app)
      .post("/jobs")
      .set("Cookie", [this.csrfCookie, this.sessionCookie])
      .set("content-type", "application/x-www-form-urlencoded")
      .send(dataToPost);
      
      expect(res).to.have.status(200);
      expect(res).to.have.property("text");
      expect(res.text).to.include("List");

      const jobs = await Job.find({ createdBy: this.test_user._id });
      expect(jobs.length).to.equal(21);
});

});
