const expect = require('chai').expect
const Plop = require('../src/plop')
const Ident = Plop.Ident
const Number = Plop.Number
const Expression = Plop.Expression

describe('plop', () => {
  describe('#parse', () => {
    describe('CONSTANT statement', () => {
      it('parses constant statements', () => {
        expect(1+1).to.equal(2)
      })
    })

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
  })
})
