import fs from "fs";
import path from "path";
import FormData from "form-data";
import axios from "axios";
import logger from "@/utils/logger";

export class AudioServiceClient {
    private serviceUrl: string;
    private callbackUrl: string;

    constructor(serviceUrl: string, callbackUrl: string) {
        this.serviceUrl = serviceUrl;
        this.callbackUrl = callbackUrl;
    }

    async sendAudio(audioPath: string, idempotentKey?: string): Promise<{ status: string; [key: string]: any }> {
        const formData = new FormData();

        console.log(`audioPath: `, audioPath);

        // Verify file exists
        if (!fs.existsSync(audioPath)) {
            throw new Error(`File not found: ${audioPath}`);
        }

        formData.append("file", fs.createReadStream(audioPath), {
            filename: path.basename(audioPath),
            contentType: "audio/wav",
        });
        formData.append("callback", this.callbackUrl);
        formData.append("idempotent_id", idempotentKey ?? "default-key");

        const headers = {
            ...formData.getHeaders(),
            accept: "application/json",
        };
        console.log("Headers:", headers);

        try {
            const response = await axios.post(this.serviceUrl, formData, {
                headers,
            });

            logger.log("Request sent successfully:", response.data);
            return response.data as { status: string; [key: string]: any };
        } catch (error: any) {
            logger.error("Error sending audio:", error.message);
            if (error.response) {
                console.log("Response error data:", error.response.data);
                console.log("Response status:", error.response.status);
            }
            return { status: "failed", error: error.message };
        }
    }
}