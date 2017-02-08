const expect = require('chai').expect
const Evaluator = require('../src/evaluator')
const Statement = require('../src/plop').Statement
const Block = require('../src/plop').Block

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
  describe('#evaluateStatement', () => {
    describe('if statements', () => {
      it('correctly parses an if statement', () => {
        const ifStatement = Statement.parse(`
          if 1 # 2 then begin
          a := 1 ;
        end`)
        var testEnv = {
          vars: {
            a: false
          },
          consts: {}
        }
        Evaluator.evaluateStatement(ifStatement, testEnv)
        expect(testEnv).to.deep.equal({
          vars: {
            a: { number: 1 }
          },
          consts: {}
        })
      })
    })
    describe('while statements', () => {
      const whileStatement = Statement.parse(`
      while a < 2 do begin
        a := a + 1;
      end
      `)
      var testEnv = {
        vars: {
          a: { number: 0 }
        },
        consts: {}
      }
      it ('assigns values to {ident: "a"} and exits while loop', () => {
        Evaluator.evaluateStatement(whileStatement, testEnv)
        expect(testEnv).to.deep.equal({
          vars: {
            a: { number: 2 }
          },
          consts: {}
        })
      })
    })
    describe('begin statements', () => {
      it ('evaluates begin statement with assignment', () => {
        const testBegin = Statement.parse(`
        begin
          a := a + a ;
        end
        `)
        var testEnv = {
          vars: {
            a: { number: 2 },
          },
          consts: {}
        }
        Evaluator.evaluateStatement(testBegin, testEnv)
        expect(testEnv).to.deep.equal({
          vars: {
            a: { number: 4 }
          },
          consts: {}
        })
      })
    })
  })
  describe('#evaluateBlock', () => {
    describe('Add one and two', () => {
      it ('can evaluate complex multi-statement blocks', () => {
        const testBlock = Block.parse(`
        const
          one = 1,
          three = 2;

        var n;

        procedure addOne; n := n + one;

        procedure addThree; n := n + three;

        begin
          n := 1;
          while n < 20 do begin
            if odd n then begin
              call addOne;
            end;
            if odd n+1 then begin
              call addThree;
            end;
          end;
        end
        `)
        var testEnv = {
          consts: {},
          vars: {},
          procedures: {}
        }
        Evaluator.evaluateBlock(testBlock, testEnv)
        expect(testEnv.vars.n).to.deep.equal({number: 21})
      })
    })
  })
})
