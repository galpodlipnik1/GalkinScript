export enum TokenType {
  //Literal types
  Number,
  Identifier,
  //Reserved keywords
  Let,
  
  //Operators
  Equals,
  OpenParen, 
  CloseParen,
  BinaryOperator,
  //end of file
  EOF,
}

const KEYWORDS: Record<string, TokenType> = {
  let: TokenType.Let,
};

export interface Token {
  value: string,
  type: TokenType,
}

function token(value = "", type: TokenType): Token {
  return { value, type };
}

function isAlpha (src: string) {
  return src.toUpperCase() != src.toLowerCase(); //TODO better way to do this
}

function isSkippable (src: string) {
  return src == ' ' || src == '\n' || src == '\t'; //TODO better way to do this
}

function isInt (str: string) {
  const c = str.charCodeAt(0);
  const bounds = ['0'.charCodeAt(0), '9'.charCodeAt(0)]; //TODO better way to do this
  return (c >= bounds[0] && c <= bounds[1])
}


export function tokenize (sourceCode: string): Token[] {
  const tokens = new Array<Token>();
  const src = sourceCode.split("");

  //Build each token until end of source code
  while (src.length > 0) {
    if(src[0] == '(') {
      tokens.push(token(src.shift(), TokenType.OpenParen));
    } else if (src[0] == ')') {
      tokens.push(token(src.shift(), TokenType.CloseParen));
    } else if (src[0] == '+' || src[0] == '-' || src[0] == '*' || src[0] == '/' || src[0] == '%') {
      tokens.push(token(src.shift(), TokenType.BinaryOperator));
    } else if (src[0] == '=') {
      tokens.push(token(src.shift(), TokenType.Equals));
    } else {
      //handle multi-character tokens

      if(isInt(src[0])) {
        let num = "";
        while (src.length > 0 && isInt(src[0])) {
          num += src.shift();
        }

        tokens.push(token(num, TokenType.Number));
      } else if (isAlpha(src[0])) {
        let ident = "";
        while (src.length > 0 && isAlpha(src[0])) {
          ident += src.shift();
        }
        //check for reserved keywords
        const reserved = KEYWORDS[ident];
        if (typeof reserved == "number") {
          tokens.push(token(ident, reserved));
        } else {
          tokens.push(token(ident, TokenType.Identifier));
        }
      } else if (isSkippable(src[0])) {
        src.shift(); //skip the current character
      } else {
        console.log("Unexpected character in source: " + src[0]);
        Deno.exit(1);
      }

    }
  }
  tokens.push({ type: TokenType.EOF, value: "EndOfFile" });
  return tokens;
}