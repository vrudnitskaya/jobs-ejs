const chai = require('chai');
const chaiHttp = require('chai-http');
const { app } = require('../app'); 
chai.use(chaiHttp);
const { expect } = chai;

describe("test multiply api", function () {
  it("should multiply two numbers", async () => {
    const res = await chai.request(app)
      .get("/multiply")
      .query({ first: 7, second: 6 });

    expect(res).to.have.status(200);
    expect(res).to.have.property("body");
    expect(res.body).to.have.property("result");
    expect(res.body.result).to.equal(42);
  });
});
