// deno-lint-ignore-file no-explicit-any
import { Stmt, Program, Expr, BinaryExpr, Identifier, NumericLiteral, VarDeclaration, AssignmentExpr } from "./ast.ts";
import { tokenize, Token, TokenType } from "./lexer.ts";

export default class Parser {
  private tokens: Token[] = [];

  private not_eof(): boolean {
    return this.tokens[0].type != TokenType.EOF;
  }

  private at() {
    return this.tokens[0];
  }

  private eat() {
    const prev = this.tokens.shift() as Token;
    return prev;
  }

  private expect(type: TokenType, err: any) {
    const prev = this.tokens.shift() as Token;
    if (!prev || prev.type != type) {
      console.log("Parser error: " + err, prev, "Expected: " + type);
      Deno.exit(1);
    }

    return prev;
  }

  public produceAST(sourceCode: string): Program {
    this.tokens = tokenize(sourceCode);
    const program: Program = {
      kind: "Program",
      body: [],
    };

    //Parse until end of file
    while(this.not_eof()) {
      program.body.push(this.parse_stmt());
    }

    return program;
  }

  private parse_stmt(): Stmt {
    // skip to parse_expr
    switch (this.at().type){
      case TokenType.Let:
      case TokenType.Const:
        return this.parse_var_declaration();
      default:
        return this.parse_expr();
    }
  }


  parse_var_declaration(): Stmt {
    const isConstant = this.eat().type == TokenType.Const;
    const identifier = this.expect(TokenType.Identifier, "Expected identifier after let/const").value;

    if(this.at().type == TokenType.Semicolon){
      this.eat();
      if(isConstant)
        throw "Must assign a value to a constant expression. No value provided.";

      return { kind: "VarDeclaration", identifier, constant: false } as VarDeclaration;
    }

    this.expect(TokenType.Equals, "Expected = after identifier in var declaration");

    const declaration = { kind: "VarDeclaration", value: this.parse_expr(), identifier, constant: isConstant } as VarDeclaration;

    this.expect(TokenType.Semicolon, "Expected ; after var declaration");
    return declaration;
  }

  private parse_expr(): Expr {
    return this.parse_assignment_expr();
  }

  parse_assignment_expr(): Expr {
    const left = this.parse_additive_expr(); //switch to objectExpr

    if(this.at().type == TokenType.Equals) {
      this.eat();
      const value = this.parse_assignment_expr();
      return { value, assigne: left, kind: "AssignmentExpr" } as AssignmentExpr;
    }

    return left;
  }

  private parse_additive_expr(): Expr {
    let left = this.parse_multiplicative_expr();

    while (this.at().value == "+" || this.at().value == "-"){
      const operator = this.eat().value;
      const right = this.parse_multiplicative_expr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator
      } as BinaryExpr;
    }

    return left;
  }

  private parse_multiplicative_expr(): Expr {
    let left = this.parse_primary_expr();

    while (this.at().value == "/" || this.at().value == "*" || this.at().value == "%"){
      const operator = this.eat().value;
      const right = this.parse_primary_expr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator
      } as BinaryExpr;
    }

    return left;
  }

  //Orders of precedence
  // AdditiveExpr
  // MultiplicativeExpr
  // Primary Expression

  private parse_primary_expr(): Expr {
    const tk = this.at().type;

    switch (tk) {
      case TokenType.Identifier:
        return { kind:"Identifier", symbol:this.eat().value } as Identifier;
      case TokenType.Number:
        return { kind:"NumericLiteral", value:parseFloat(this.eat().value) } as NumericLiteral;
      case TokenType.OpenParen: {
        this.eat(); //eat the opening paren
        const value = this.parse_expr();
        this.expect(
          TokenType.CloseParen,
          "Expected closing paren after expression",
        );
        return value;
      }
      
      default:
        console.log("Unexpected token found during parsing!: " + this.at().value);
        Deno.exit(1);
    }

  }
}