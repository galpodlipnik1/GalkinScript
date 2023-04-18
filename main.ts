import Parser from "./frontend/parser.ts";
import Environment from "./runtime/environment.ts";
import { evaluate } from "./runtime/interpretor.ts";
import { MK_NUMBER, MK_NULL, MK_BOOL } from "./runtime/values.ts";

repl();

function repl () {
  const parser = new Parser();
  const env = new Environment();
  env.declareVar("x", MK_NUMBER(100));
  env.declareVar("true", MK_BOOL(true));
  env.declareVar("false", MK_BOOL(false));
  env.declareVar("null", MK_NULL());
  console.log("\nGalkinScript Repl v0.0.1")
  
  while (true) {
    const input = prompt("> ");

    if(!input || input.includes("exit")) {
      Deno.exit(1);
    }

    const program = parser.produceAST(input);

    const result = evaluate(program, env);
    console.log(result);    
  }
}
