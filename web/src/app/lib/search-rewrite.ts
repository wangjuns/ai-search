import { Message } from "../interfaces/message";
import getClient from "./client";
import { logger } from "./logger";


async function searchRewrite(query: string, prev_messages: Message[]): Promise<string> {

    if (!prev_messages || prev_messages.length == 0) {
        return query;
    }

    const messages = [
        {
            role: "system",
            content: "你是一个搜索助手，会根据聊天的内容生成搜索关键词，以帮助回答问题。回答仅仅返回搜索关键词就可以了。"
        },
        {
            role: "user",
            content: `下面是关于问题的对话：\n
                    ${JSON.stringify(prev_messages)}\n
                    新的问题是: ${query}。\n
                    要回答这个问题，我需要使用什么关键词搜索。`
        }
    ]

    logger.debug('rewrite messages: ', messages)

    const response = await getClient().getChatCompletions(process.env.AZURE_OPENAI_DEPLOYMENT_ID!,
        //@ts-expect-error ignore type check
        messages,
        {
            maxTokens: 500,
            temperature: 0.8,
            // stop,
        })

    const rewitedQuery = response.choices[0].message?.content
    return rewitedQuery ? rewitedQuery : query;
}

export default searchRewrite;