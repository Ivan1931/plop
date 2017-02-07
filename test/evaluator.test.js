const expect = require('chai').expect
const Evaluator = require('../src/evaluator')

describe('Evaluator', () => {
  describe('#evaluateExpression', () => {
    let onePlusOne = {
      first: { number: 1 },
      sign: '+',
      rest: [{
        op: '+',
        term: { number: 1 }
      }]
    }
    it('evalutates a simple "1 + 1" expression', () => {
      expect(Evaluator.evaluateExpression(onePlusOne, {})).to.deep.equal(2)
    })

    let twoTimesOnePlusOne = {
      first: { number: 2 },
      rest: [{
        op: '*',
        term: onePlusOne
      }]
    }
    it('evalutates 2*(1+1) correctly', () => {
      expect(Evaluator.evaluateExpression(twoTimesOnePlusOne)).to.deep.equal(4)
    })
    it ('evaluates -2*(1+1) correctly', () => {
      let testNegative = {
        first: twoTimesOnePlusOne,
        sign: '-',
        rest: []
      }
      expect(Evaluator.evaluateExpression(testNegative)).to.deep.equal(-4)
    })
  })
})
