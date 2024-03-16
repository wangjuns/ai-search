import { Relate } from "./relate"
import { Source } from "./source"

export default interface SearchResult {
    query: string,
    answer: string,
    sources: Source[],
    relates?: Relate[],
}