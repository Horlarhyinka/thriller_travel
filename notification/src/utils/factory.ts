import { Templates } from "./enums";
import { existsSync } from "fs";
import * as path from "path"
import * as ejs from "ejs"


export const compileTemplate = async(template: Templates, data: object)=>{
    const lcn = path.resolve(__dirname, "../templates/"+template+".ejs")
    const exists = existsSync(lcn)
    if(!exists)throw Error("template file not found.")
    return ejs.renderFile(lcn, data)
}