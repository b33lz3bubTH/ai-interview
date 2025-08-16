/*
docker run -d \
  --name=faster-whisper \
  -e WHISPER_MODEL=tiny-int8 \
  -p 10300:10300 \
  lscr.io/linuxserver/faster-whisper:latest

*/

import FormData from "form-data";
import fs from "fs";

export class FasterWhisperClient {
  private baseUrl: string;

  constructor(baseUrl = process.env.TRANSCRIPTION_SERVER || "http://localhost:10300") {
    this.baseUrl = baseUrl;
  }

  async transcribe(filePath: string): Promise<string | unknown> {
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));

    console.log(`form: `, form);

    const response = await fetch(`${this.baseUrl}/inference`, {
      method: "POST",
      body: form,
    });

    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // Faster-Whisper returns { text, segments }
  }
}
