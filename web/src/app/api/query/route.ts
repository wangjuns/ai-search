import { google_search } from "@/app/google";
import { Message } from "@/app/interfaces/message";
import getClient from "@/app/lib/client";
import { logger } from "@/app/lib/logger";
import searchRewrite from "@/app/lib/search-rewrite";
import { StreamingTextResponse } from 'ai';
import { TextEncoder } from "util";
export const dynamic = 'force-dynamic'



const stop = [
    "<|im_end|>",
    "[End]",
    "[end]",
    "\nReferences:\n",
    "\nSources:\n",
    "End.",
]


const rag_query_text = `
You are a large language AI assistant.You are given a user question, and please write clean, concise and accurate answer to the question.You will be given a set of related contexts to the question, each starting with a reference number like[[citation: x]], where x is a number.Please use the context and cite the context at the end of each sentence if applicable.

Your answer must be correct, accurate and written by an expert using an unbiased and professional tone.Please limit to 1024 tokens.Do not give any information that is not related to the question, and do not repeat.Say "information is missing on" followed by the related topic, if the given context do not provide sufficient information.

Please cite the contexts with the reference numbers, in the format[citation:x]. If a sentence comes from multiple contexts, please list all applicable citations, like[citation: 3][citation: 5].Other than code and specific names and citations, your answer must be written in the same language as the question.

Here are the set of contexts:

{context_text}

Remember, don't blindly repeat the contexts verbatim. And here is the user question:
`;

interface PostData {
    messages: Message[],
    search_uuid: string,
    query: string,
}


export async function POST(request: Request) {

    const { messages: pre_messages, query, search_uuid }: PostData = await request.json();

    const search_query = await searchRewrite(query, pre_messages)

    logger.debug("rewrite query: ", search_query)

    const context = await google_search(search_query)
    // console.log(context)

    const context_text = context.map((c, i) => `[[citation:${i + 1}]] ${c['snippet']}`).join("\n\n");
    const system_prompt = rag_query_text.replace('{context_text}', context_text);

    // console.log(system_prompt);

    let messages = [{ "role": "system", "content": system_prompt }];

    if (pre_messages) {
        messages = messages.concat(pre_messages);
    }

    messages.push({ "role": "user", "content": query });
    logger.debug("qa prompt: ", messages)

    // Ask Azure OpenAI for a streaming chat completion given the prompt
    const events = await getClient().streamChatCompletions(
        process.env.AZURE_OPENAI_DEPLOYMENT_ID!,
        //@ts-expect-error ignore type check
        messages,
        {
            maxTokens: 1024,
            temperature: 0.8,
            // stop,
        }
    );

    const encoder = new TextEncoder()

    const outputStream = new ReadableStream({

        start(controller) {
            const references = JSON.stringify(context.map((c, i) => { return { id: i, url: c.link, name: c.title } }))
            controller.enqueue(encoder.encode(references)); // 可以在此处初始化资源，例如打开文件句柄
            controller.enqueue(encoder.encode("\n\n__LLM_RESPONSE__\n\n"))
        },
        async pull(controller) {
            for await (const event of events) {
                for (const choice of event.choices) {
                    const delta = choice.delta?.content;
                    if (delta) {
                        controller.enqueue(encoder.encode(delta));
                    }
                }
            }
            controller.close();
        },
        cancel() {
            // 当消费者取消流时调用 (例如调用了reader.cancel())
            logger.warn('Stream cancelled by the consumer.');
            // 这里可以执行一些清理工作
        }
    });


    return new StreamingTextResponse(outputStream)
}
