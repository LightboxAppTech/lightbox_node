const ONEDAY = 24 * 60 * 60 * 1000;

function generatePseudoRandomNumber() {
  return Math.round(Math.random() * 899999) + 100000;
}

function generator() {
  let n = generatePseudoRandomNumber();
  while (n < 100000 || n > 999999) {
    n = generatePseudoRandomNumber();
  }
  return { code: n, validUpTo: Date.now() + ONEDAY };
}

module.exports = { generateCode: generator };
