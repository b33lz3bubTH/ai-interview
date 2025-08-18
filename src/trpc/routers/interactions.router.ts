import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { EventManager } from "@/manager/EventManager";
import { EVENT_NAMES } from "@/constants/events";
import { Event, EventContext } from "@/shared/common/types";
import logger from "@/utils/logger";

import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { AudioServiceClient } from "@/utils/transcriber/stt";

const t = initTRPC.create();

export const interactionsRouter = t.router;
export const interactionsProcedure = t.procedure;

export function createInteractionsProcessor(eventManager: EventManager) {
  return interactionsRouter({
    /**
     * Accept audio input (buffer/base64) from client,
     * save to tmp, forward to Python STT service,
     * return metadata immediately.
     */
    transcribeAudio: interactionsProcedure
      .input(
        z.object({
          email: z.string().email(),
          audio: z.union([
            z.instanceof(Buffer),
            z.string(), // base64
            z.any(), // fallback
          ]),
        })
      )
      .mutation(async ({ input }) => {
        const { email, audio } = input;

        try {
          let audioBuffer: Buffer;

          // Handle different audio input formats
          if (Buffer.isBuffer(audio)) {
            audioBuffer = audio;
          } else if (typeof audio === "string") {
            audioBuffer = Buffer.from(audio, "base64");
          } else if (audio?.type === "Buffer" && Array.isArray(audio.data)) {
            audioBuffer = Buffer.from(audio.data);
          } else {
            throw new Error("Invalid audio format provided");
          }

          const tmpDir = "/tmp";
          const fileName = `${uuidv4()}.wav`;
          const filePath = path.join(tmpDir, fileName);

          // Ensure tmp directory exists
          if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
          }

          fs.writeFileSync(filePath, audioBuffer);

          const idempotentKey = uuidv4();

          // Inject your TRPC callback endpoint
          const callbackUrl = "http://host.docker.internal:3000/trpc/interactions.callback?batch=1";
          const client = new AudioServiceClient(
            "http://localhost:8000/submit",
            callbackUrl
          );

          // Fire-and-forget to Python
          client.sendAudio(filePath, idempotentKey);

          return {
            success: true,
            file: filePath,
            fileSize: audioBuffer.length,
            jobId: idempotentKey,
            message: "Audio file saved and sent for transcription",
          };
        } catch (error) {
          logger.error("Error processing audio:", error);
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
          throw new Error(`Failed to process audio: ${errorMessage}`);
        }
      }),

    /**
     * Callback method that Python service will call
     * with transcription result.
     */
    callback: interactionsProcedure
      .input(
        z.record(z.any())
      )
      .mutation(async ({ input }) => {
        try {
          logger.info("Received callback from STT service:", input);
          return { success: true, message: "Callback processed" };
        } catch (error) {
          logger.error("Error in callback handler:", error);
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
          throw new Error(`Failed to process callback: ${errorMessage}`);
        }
      }),
  });
}

function createEventContext(source: string, userId?: string): EventContext {
  return {
    timestamp: Date.now(),
    source,
    userId,
    correlationId: `trpc_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`,
  };
}
