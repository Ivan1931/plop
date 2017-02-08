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
  describe('#evaluateCondition', () => {
    const one_a = {
      first: { number: 1 },
      sign: '+',
      rest: []
    }

    const one_b = {
      first: { number: 1 },
      sign: '+',
      rest: []
    }

    const two = {
      first: { number: 2 },
      sign: 2,
      rest: []
    }
    it('evaluates "#" expression', () => {
      const notEqual = {
        left: one_a,
        op: '#',
        right: two
      }
      expect(Evaluator.evaluateCondition(notEqual)).to.equal(true)
    })

    it('evaluates "=" expression', () => {
      const equal = {
        left: one_a,
        op: '=',
        right: one_b
      }
      expect(Evaluator.evaluateCondition(equal)).to.equal(true)
    })
  })
})
