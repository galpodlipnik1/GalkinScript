import { RuntimeVal } from "./values.ts";


export default class Environment {
  private parent?: Environment;
  private variables: Map<string, RuntimeVal>;

  constructor(parentENV?: Environment) {
    this.parent = parentENV;
    this.variables = new Map();
  }

  public declareVar (varname: string, value: RuntimeVal): RuntimeVal {
    if(this.variables.has(varname)){
      throw `Cannot redeclare variable '${varname}' in the same scope`;
    }

    this.variables.set(varname, value);
    return value;
  }

  public assignVar (varname: string, value: RuntimeVal): RuntimeVal {
  
  }

  public resolve (varname: string): Environment {
    if(this.variables.has(varname))
      return this;
    
    if(this.parent == undefined)
      throw `Cannot resolve variable '${varname}' in the current scope`;
    
    return this.parent.resolve(varname);
  }
}