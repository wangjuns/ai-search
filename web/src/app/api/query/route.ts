import { google_search } from "@/app/google";
import { Readable, PassThrough, pipeline } from "stream";
import { OpenAIClient, AzureKeyCredential } from '@azure/openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { promisify } from "util";

const pipelineAsync = promisify(pipeline);

const client = new OpenAIClient(
    process.env.AZURE_OPENAI_ENDPOINT,
    new AzureKeyCredential(process.env.AZURE_OPENAI_API_KEY!),
);

const stop = [
    "<|im_end|>",
    "[End]",
    "[end]",
    "\nReferences:\n",
    "\nSources:\n",
    "End.",
]


const rag_query_text = `
You are a large language AI assistant built by Lepton AI.You are given a user question, and please write clean, concise and accurate answer to the question.You will be given a set of related contexts to the question, each starting with a reference number like[[citation: x]], where x is a number.Please use the context and cite the context at the end of each sentence if applicable.

Your answer must be correct, accurate and written by an expert using an unbiased and professional tone.Please limit to 1024 tokens.Do not give any information that is not related to the question, and do not repeat.Say "information is missing on" followed by the related topic, if the given context do not provide sufficient information.

Please cite the contexts with the reference numbers, in the format[citation:x]. If a sentence comes from multiple contexts, please list all applicable citations, like[citation: 3][citation: 5].Other than code and specific names and citations, your answer must be written in the same language as the question.

Here are the set of contexts:

{context_text}

Remember, don't blindly repeat the contexts verbatim. And here is the user question:
`;


export async function POST(request: Request) {

    const { query, search_uuid } = await request.json();
    const context = await google_search(query)
    // console.log(context)

    const context_text = context.map((c, i) => `[[citation:${i + 1}]] ${c['snippet']}`).join("\n\n");
    const system_prompt = rag_query_text.replace('{context_text}', context_text);

    // console.log(system_prompt);

    const messages = [
        { "role": "system", "content": system_prompt },
        { "role": "user", "content": query },
    ]

    //创建一个可读流



    // Ask Azure OpenAI for a streaming chat completion given the prompt
    const events = await client.streamChatCompletions(
        process.env.AZURE_OPENAI_DEPLOYMENT_ID,
        messages,
        {
            maxTokens: 1024,
            temperature: 0.8,
            // stop,
        }
    );

    const passThroughStream = new PassThrough();

    passThroughStream.write(JSON.stringify(context.map((c, i) => { return { id: i, url: c.link, name: c.title } })));
    passThroughStream.write("\n\n__LLM_RESPONSE__\n\n");

    // 创建一个新的Response对象
    const response = new Response(passThroughStream, {
        headers: { 'Content-Type': 'text/plain' }
    });

    // Read events 
    (async function () {
        for await (const event of events) {
            for (const choice of event.choices) {
                const delta = choice.delta?.content;
                if (delta !== undefined) {
                    passThroughStream.write(delta);
                }
            }
        }
        passThroughStream.end();
    })();

    return Promise.resolve(response);
}
