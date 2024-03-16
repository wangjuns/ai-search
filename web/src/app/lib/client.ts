import { OpenAIClient, AzureKeyCredential } from "@azure/openai";


let client: OpenAIClient;

function getClient(): OpenAIClient {
    if (!client) {
        client = new OpenAIClient(
            process.env.AZURE_OPENAI_ENDPOINT!,
            new AzureKeyCredential(process.env.AZURE_OPENAI_API_KEY!),
        )
    }
    return client;
}

export default getClient;