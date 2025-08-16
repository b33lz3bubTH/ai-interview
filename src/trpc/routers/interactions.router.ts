import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { EventManager } from '@/manager/EventManager';
import { EVENT_NAMES } from '@/constants/events';
import { Event, EventContext } from '@/shared/common/types';
import logger from '@/utils/logger';

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FasterWhisperClient } from '@/utils/transcriber/stt';

const t = initTRPC.create();

export const interactionsRouter = t.router;
export const interactionsProcedure = t.procedure;

export function createInteractionsProcessor(eventManager: EventManager) {
    return interactionsRouter({
        transcribeAudio: interactionsProcedure
            .input(
                z.object({
                    email: z.string().email(),
                    audio: z.union([
                        z.instanceof(Buffer),
                        z.string(), // Allow base64 string as alternative
                        z.any() // Fallback for flexibility
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
                    } else if (typeof audio === 'string') {
                        audioBuffer = Buffer.from(audio, 'base64');
                    } else if (audio?.type === 'Buffer' && Array.isArray(audio.data)) {
                        audioBuffer = Buffer.from(audio.data);
                    } else {
                        throw new Error('Invalid audio format provided');
                    }

                    const tmpDir = '/tmp';
                    const fileName = `${uuidv4()}.wav`;
                    const filePath = path.join(tmpDir, fileName);

                    // Ensure tmp directory exists
                    if (!fs.existsSync(tmpDir)) {
                        fs.mkdirSync(tmpDir, { recursive: true });
                    }

                    fs.writeFileSync(filePath, audioBuffer);

                    const client = new FasterWhisperClient("http://localhost:10300");
                    logger.info(`filePath: ${filePath} will be transcribed`)
                    const text = await client.transcribe(filePath);
                    console.log(`response text: `, text);

                    return {
                        success: true,
                        file: filePath,
                        fileSize: audioBuffer.length,
                        text,
                        message: 'Audio file saved successfully',
                    };
                } catch (error) {
                    logger.error('Error processing audio:', error);
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                    throw new Error(`Failed to process audio: ${errorMessage}`);
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
