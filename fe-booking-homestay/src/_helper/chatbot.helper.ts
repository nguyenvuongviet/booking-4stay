import { ERROR_MESSAGES } from "@/constants/chatbot";

export const getTime = () => {
    return new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const getErrorMessage = (error: unknown): string => {
    if (!navigator.onLine) {
        return ERROR_MESSAGES.OFFLINE;
    }

    if (error instanceof Error) {
        const message = error.message.toLowerCase();

        if (message.includes("failed to fetch")) {
            return ERROR_MESSAGES.REQUEST_FAILED;
        }

        if (message.includes("timeout")) {
            return ERROR_MESSAGES.TIMEOUT;
        }

        if (message.includes("empty")) {
            return ERROR_MESSAGES.EMPTY;
        }

        if (message.includes("401")) {
            return ERROR_MESSAGES.UNAUTHORIZED;
        }

        if (message.includes("429")) {
            return ERROR_MESSAGES.RATE_LIMIT;
        }

        if (
            message.includes("500") ||
            message.includes("502") ||
            message.includes("503")
        ) {
            return ERROR_MESSAGES.SERVER_ERROR;
        }
    }

    return ERROR_MESSAGES.DEFAULT;
};