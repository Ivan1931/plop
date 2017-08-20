const expect = require('chai').expect
const Evaluator = require('../src/plop').Evaluator
const Statement = require('../src/plop').Parser.Statement
const Block = require('../src/plop').Parser.Block
const Parser = require('../src/plop').Parser.Parser

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
  describe('odd', () => {
    it ('evaluates odd statement correctly', () => {
        var testEnv = {
          vars: {
            n: { number: 1 },
          },
          consts: {}
        }
        const testOdd = Statement.parse(`
            begin
                if odd 1 then begin
                    n := 1;
                end;

                if odd n+1 then begin
                    n := 2;
                end;
                
               if odd n then begin
                    n := 3;
               end;
            end
        `)
        Evaluator.evaluateStatement(testOdd, testEnv)
        expect(testEnv.vars.n).to.deep.equal({number: 3})
        
    })
  })
  describe('#evaluateBlock', () => {
    var testEnv = {
      consts: {},
      vars: {},
      procedures: {},
      printer: (i) => {}
    }
    var unassigned = Block.parse(`
      var n;
      begin
        print n;
      end
    `)
    it ('throws error when you try print unassigned variable', () => {
        expect(() => {
            Evaluator.evaluateBlock(unassigned, testEnv)
        }).to.throw(`"n" has been created`)
    })
    describe('Add one and two', () => {
      it ('can evaluate complex multi-statement blocks', () => {
        const testBlock = Block.parse(`
        const
          one = 1,
          three = 3;

        var n;

        procedure addOne; n := n + one;

        procedure addThree; n := n + three;

        begin
          n := 1;
          while n < 10 do begin
            if odd n then begin
              call addOne;
              print n;
            end;
            if odd n+1 then begin
              call addThree;
            end;
          end;
        end
        `)
        Evaluator.evaluateBlock(testBlock, testEnv)
        expect(testEnv.vars.n).to.deep.equal({number: 13})
        let sum = 0
        Evaluator.evaluate(testBlock, (n) => {
            sum += n
        })
        expect(sum).to.deep.equal(18)
      })

    })
  })
  describe('#evaluate', () => {
    it ('evaluates another really complex expression', () => {
      const testProgram = `
      const
        m =  7,
        n = 85;

      var
        x, y, z, q, r;

      procedure multiply;
      var a, b;
      begin
        a := x;
        b := y;
        z := 0;
        while b > 0 do begin
          if odd b then z := z + a;
          a := 2 * a;
          b := b / 2;
        end;
      end;

      procedure divide;
      var w;
      begin
        r := x;
        q := 0;
        w := y;
        while w <= r do w := 2 * w;
        while w > y do begin
          q := 2 * q;
          w := w / 2;
          if w <= r then begin
            r := r - w;
            q := q + 1;
          end;
        end;
      end;

      procedure gcd;
      var f, g;
      begin
        f := x;
        g := y;
        while f # g do begin
          if f < g then g := g - f;
          if g < f then f := f - g;
        end;
        z := f
      end;

      begin
        x := m;
        y := n;
        call multiply;
        print z;
        x := 25;
        y :=  3;
        call divide;
        print q;
        x := 84;
        y := 36;
        call gcd;
        print z;
      end
      `
      const testProgramAST = Parser.parse(testProgram)
      var printed = []
      Evaluator.evaluate(testProgramAST, value => {
        printed.push(value)
      })
      expect(printed).to.deep.equal([595,8,12])
    })
  })
})
