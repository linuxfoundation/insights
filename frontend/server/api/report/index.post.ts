import type {ReportRequest} from "~~/types/report/requests.types";

export default defineEventHandler(async (event): Promise<object> => {
    const body: ReportRequest = await readBody(event)
    return body
});
