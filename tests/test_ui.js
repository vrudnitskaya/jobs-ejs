const { app } = require("../app.js");
const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp); 

describe("test getting a page", function () {
  it("should get the index page", async () => {
    chai
        .request(app)
        .get("/")
        .send()
        .end((err, res) => {
            expect(err).to.equal(null);
            expect(res).to.have.status(200);
            expect(res).to.have.property("text");
            expect(res.text).to.include("Click this link");
            done();
          })
  });
});
