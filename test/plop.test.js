const expect = require('chai').expect
const Plop = require('../src/plop')
const Ident = Plop.Ident
const Number = Plop.Number
const Expression = Plop.Expression
const Condition = Plop.Condition
const Statement = Plop.Statement
const Block = Plop.Block

describe('plop', () => {
  describe('#parse', () => {
    describe('IDENT symbols', () => {
      it('parses a single letter', () => {
        expect(Ident.parse('a')).to.equal('a')
      })

      it('ignores whitespace', () => {
        expect(Ident.parse('       Hello\n   \t\n\r    ')).to.deep.equal('Hello')
      })

      it('throws an error if there are numbers', () => {
        expect(() => Ident.parse('123')).to.throw(/SyntaxError/)
      })
    })

    describe('Number symbols', () => {
      it('parses a valid number', () => {
        expect(Number.parse('1234')).to.equal(1234)
      })

      it('parses a number with spaces', () => {
        expect(Number.parse('  \n\n\t\r\n 1234    ')).to.equal(1234)
      })

      it('does not parse a number with a space', () => {
        expect(() => Number.parse('123 4')).to.throw(/SyntaxError/)
      })

      it('does not parse letters in numbers', () => {
        expect(() => Number.parse('12a3')).to.throw(/SyntaxError/)
      })
    })

    describe('Expressions', () => {
      it('parses 1 + 1', () => {
        expect(Expression.parse('1 + 1')).to.deep.equal({
          first: {
            number: 1
          },
          sign: "+",
          rest: [{
            op: "+",
            term: {
              number: 1
            }
          }]
        })
      })

      it('parses 1 + 1 + 1', () => {
        expect(Expression.parse('1+1+1')).to.deep.equal({
          first: {
            number: 1
          },
          sign: "+",
          rest: [{
            op: "+",
            term: {
              number: 1
            }
          }, {
            op: "+",
            term: {
              number: 1
            }
          }]
        })
      })

      it ('parses 1+a where a is an "ident"', () => {
        expect(Expression.parse('1+a')).to.deep.equal({
          first: {
            number: 1
          },
          sign: "+",
          rest: [{
            op: "+",
            term: {
              ident: "a"
            }
          }]
        })
      })

      it ('parses a single negative number', () => {
        expect(Expression.parse('-1')).to.deep.equal({
          first: {
            number: 1
          },
          sign: "-",
          rest: []
        })
      })

      it ('parses a bracketed expression', () => {
        expect(Expression.parse(' (1+ 1 ) ')).to.deep.equal({
          first: {
            expression: {
              first: { number: 1 },
              sign: '+',
              rest: [{
                op: '+',
                term: { number: 1 }
              }]
            }
          },
          rest: [],
          sign: '+'
        })
      })

      it ('parses a complex expression', () => {
        const parseResult = Expression.parse('1+2*(4+a)')
        expect(parseResult).to.deep.equal(
          {
            "first": {
              "number": 1
            },
            "sign": "+",
            "rest": [
              {
                "op": "+",
                "term": {
                  "first": {
                    "number": 2
                  },
                  "rest": [
                    {
                      "op": "*",
                      "factor": {
                        "expression": {
                          "first": {
                            "number": 4
                          },
                          "sign": "+",
                          "rest": [
                            {
                              "op": "+",
                              "term": {
                                "ident": "a"
                              }
                            }
                          ]
                        }
                      }
                    }
                  ]
                }
              }
            ]
          }
        )
      })
    })

    describe('Conditions', () => {
      it ('parses "1+1${operator}=2"', () => {
        for(var op of ['=', '>=', '<=', '<', '>', '#']) {
          expect(Condition.parse(`1+1${op}2`)).to.deep.equal({
            left: {
              first: { number: 1 },
              sign: '+',
              rest: [{
                op: '+',
                term: { number: 1 }
              }]
            },
            op: op,
            right: {
              first: {number: 2},
              sign: '+',
              rest: []
            }
          })
        }
      })

      it ('parsees odd${expression}', () => {
        expect(Condition.parse(`odd 1`)).to.deep.equal({
          odd: {
            first: { number: 1 },
            sign: '+',
            rest: []
          }
        })
      })
    })

    describe("Statement", () => {
      it ('parses assignments', () => {
        expect(Statement.parse('a := 1')).to.deep.equal({
          assignment: {
            ident: 'a',
            expression: {
              first: { number: 1 },
              sign: '+',
              rest: []
            }
          }
        })
      })

      it ('parses function calls', () => {
        expect(Statement.parse('   call          a')).to.deep.equal({
          call: 'a'
        })
      })

      it ('parses begin calls', () => {
        const testStatement = `
        begin
        hello := 1 ;
        world := 2;
        end
        `
        const parseResult = Statement.parse(testStatement)
        expect(parseResult).to.deep.equal({
          begin: [
            {
              assignment: {
                ident: 'hello',
                expression: {
                  sign: '+',
                  first: { number: 1 },
                  rest: []
                }
              }
            },
            {
              assignment: {
                ident: 'world',
                expression: {
                  sign: '+',
                  first: { number: 2 },
                  rest: []
                }
              }
            }
          ]
        })
      })

      it ('parses if statement', () => {
        const testStatement = `
        if 1 = 1 then begin
        call f ;
        end
        `
        const testResult = Statement.parse(testStatement)
        expect(testResult).to.deep.equal({
          if : {
            condition: {
              left: {
                sign: '+',
                first: { number: 1 },
                rest: []
              },
              op: '=',
              right: {
                sign: '+',
                first: { number: 1 },
                rest: []
              }
            },
            statement: {
              begin: [{
                call: 'f'
              }]
            }
          }
        })
      })

      it ('parses while loop', () => {
        const testLoop = `
        while yellow = mellow do begin
        yellow := yellow + 1 ;
        end
        `
        const testResult = Statement.parse(testLoop)
        expect(testResult).to.deep.equal({
          while: {
            condition: {
              left: {
                first: { ident: 'yellow' },
                sign: '+',
                rest: []
              },
              op: '=',
              right: {
                first: { ident: 'mellow' },
                sign: '+',
                rest: []
              }
            },
            statement: {
              begin: [{
                assignment: {
                  ident: 'yellow',
                  expression: {
                    sign: '+',
                    first: { ident: 'yellow' },
                    rest: [{
                      op: '+',
                      term: { number: 1 }
                    }]
                  }
                }
              }]
            }
          }
        })
      })
    })

    describe('parsing a Block', () => {
      var expectedBlockResult;
      beforeEach(() => {
      expectedBlockResult = {
        consts: null,
        vars: null,
        statement: {
          call: 'a'
        },
        procedures: [{
          name: 'assignOneToA',
          body: {
            consts: null,
            vars: null,
            procedures: [],
            statement: {
              begin: [{
                assignment: {
                  ident: 'a',
                  expression: {
                    first: { number: 1 },
                    sign: '+',
                    rest: []
                  }
                }
              }]
            }
          }
        }]
      }
    })
      it ('parses a block with only a procedure', () => {
        const testBlock = `
        procedure assignOneToA; begin
        a := 1 ;
        end;

        call a
        `
        const testResult = Block.parse(testBlock)
        expect(testResult).to.deep.equal(expectedBlockResult)
      })
      it ('parses block with procedures and vars', () => {
        const testBlock = `
        const x=2, y=3, z =      4;
        var a,b,c;
        procedure assignOneToA; begin
          a := 1 ;
        end;

        call a
        `
        expectedBlockResult.consts = [
          {ident: 'x', value: 2},
          {ident: 'y', value: 3},
          {ident: 'z', value: 4}
        ]
        expectedBlockResult.vars = ['a', 'b', 'c']
        const actualResult = Block.parse(testBlock)
        expect(expectedBlockResult).to.deep.equal(actualResult)
      })
    })
  })
})
