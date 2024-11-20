import createClient from "openapi-fetch";
import { paths } from "../schema";

export const fetchClient = createClient<paths>();