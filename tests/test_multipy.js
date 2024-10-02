const multiply = require("../util/multiply");
const chai = require('chai');
const { expect } = chai;  // Используем expect из chai

describe("testing multiply", () => {
  it("should give 7 * 6 is 42", () => {
    expect(multiply(7, 6)).to.equal(42);  // Тестируем функцию multiply
  });
});
