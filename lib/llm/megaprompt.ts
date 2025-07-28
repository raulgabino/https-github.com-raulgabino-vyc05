import OpenAI from "openai"
import { buildResponseFn, SYSTEM_PROMPT } from "./schema"

const openai = new OpenAI()

export async function runMegaPrompt(userQuery: string, candidates: any[], catalogSlugs: string[]) {
  const rsp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    function_call: "auto",
    functions: [buildResponseFn],
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userQuery },
      {
        role: "assistant",
        content: JSON.stringify({ candidates, catalogSlugs }),
      },
    ],
    temperature: 0.7,
  })

  return JSON.parse(rsp.choices[0].message.function_call!.arguments as string)
}
