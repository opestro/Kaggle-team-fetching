import { Injectable, InternalServerErrorException, NotFoundException, Logger } from '@nestjs/common';
import { exec } from 'child_process'; // Import Node.js child process module
import * as fs from 'fs';
import * as Kpath from 'path';
import * as csvParser from 'csv-parser';

import { promisify } from 'util'; // To promisify exec
import { Readable } from 'stream'; // Import Readable to create a stream from string

// Promisify the exec function for easier async/await usage
const execPromise = promisify(exec);

// Define an interface for the structure of a leaderboard entry
// Adjust properties based on typical Kaggle leaderboard CSV columns
export interface LeaderboardEntry {
  TeamId: string;
  TeamName: string;
  SubmissionDate: string;
  Score: string;
  // Add Rank or other relevant columns if they exist in the specific CSV
  // Rank?: string; // Example
}

@Injectable()
export class AppService {
  // Add a logger for better debugging
  private readonly logger = new Logger(AppService.name);

  setTeamName(): string {
    // Keep your existing placeholder or implement actual logic
    return 'Team name functionality not implemented yet.';
  }

  /**
   * Gets the Kaggle CLI command path based on the environment
   * @returns The path to the Kaggle CLI executable
   */
  private getKagglePath(): string {
    // Check if we're running in Docker (VIRTUAL_ENV will be set in dockerfile)
    if (process.env.VIRTUAL_ENV) {
      // In Docker with virtual environment already in PATH
      return 'kaggle';
    } else {
      // Local environment with local virtual environment
      return Kpath.join(process.cwd(), 'kaggle-env/bin/kaggle');
    }
  }

  /**
   * Fetches the public leaderboard for a given Kaggle competition using 'view -s'.
   * Note: This might only return the top entries, not the full leaderboard.
   * @param competitionSlug The URL slug of the Kaggle competition (e.g., 'titanic').
   * @returns A promise resolving to an array of leaderboard entries.
   * @throws NotFoundException if the competition or leaderboard is not found.
   * @throws InternalServerErrorException for other errors (CLI execution, parsing, auth).
   */
  async getLeadBoard(competitionSlug: string): Promise<LeaderboardEntry[]> {

    try {
      // --- Step 1: Execute Kaggle CLI command ---
      // Use '--show'. Ensure no '-q' so headers are included.
      // Using the format from your latest working execution
      const kagglePath = this.getKagglePath();
      const command = `${kagglePath} competitions leaderboard "${competitionSlug}" --show`;
      this.logger.log(`Executing Kaggle CLI command: ${command}`);

       // Execute the command and capture stdout/stderr
      const maxBufferSizeBytes = 50 * 1024 * 1024; // 50 MB
      this.logger.log(`Executing Kaggle CLI command with maxBuffer: ${maxBufferSizeBytes / 1024 / 1024}MB`);

      const { stdout, stderr } = await execPromise(command, { maxBuffer: maxBufferSizeBytes });

      if (stderr) {
         this.logger.warn(`Kaggle CLI stderr (non-fatal): ${stderr}`);
      }

      this.logger.log(`Successfully executed Kaggle CLI command for ${competitionSlug}. Output length: ${stdout.length}`);
      if (!stdout || stdout.trim().length === 0) {
          this.logger.warn(`Kaggle CLI command returned empty stdout for ${competitionSlug}.`);
          return [];
      }

      // --- Step 1.5: Log Raw Output Header ---
      // Log the first ~500 characters to see headers and delimiter
      this.logger.debug(`Raw stdout start (first 500 chars):\n${stdout.substring(0, 500)}`);

      // --- Step 2: Parse the stdout CSV data ---
      const results: LeaderboardEntry[] = [];
      return new Promise((resolve, reject) => {
        const stream = Readable.from(stdout);

        stream
          // Configure csv-parser:
          // 1. Try specifying separator if it's not comma (e.g., tab '\t' or space ' ')
          // 2. Use mapHeaders to normalize header names (remove extra spaces, standardize case)
          .pipe(csvParser({
              skipLines: 2, // Skip the header and separator lines
              mapHeaders: ({ header }) => header.trim(), // Trim whitespace from headers
              mapValues: ({ value }) => value.trim() // Trim whitespace from values
          }))
          .on('data', (data: any) => {
            // --- Step 2.1: Log Parsed Row ---
            this.logger.debug('Raw parsed data row:', data);

            // Process the value part of the data (ignore the key)
            const processRow = (row: string) => {
              // Split the row into components using regex to handle multiple spaces
              const parts = row.split(/\s+/).filter(part => part.trim() !== '');
              
              // The format is: teamId teamName submissionDate score
              // Find the index where the date starts (YYYY-MM-DD format)
              const dateIndex = parts.findIndex(part => /^\d{4}-\d{2}-\d{2}$/.test(part));
              
              if (dateIndex === -1) {
                this.logger.warn(`Could not find date in row: ${row}`);
                return null;
              }

              const teamId = parts[0];
              const teamName = parts.slice(1, dateIndex).join(' ');
              const submissionDate = parts[dateIndex] + ' ' + parts[dateIndex + 1];
              const score = parts[parts.length - 1];

              return {
                TeamId: teamId,
                TeamName: teamName,
                SubmissionDate: submissionDate,
                Score: score
              };
            };

            // Only process the value part (ignore the key)
            const entry = processRow(Object.values(data)[0] as string);

            // Add the entry to results if it has valid data
            if (entry && entry.TeamId && entry.TeamName && entry.Score) {
              results.push(entry);
            }

            this.logger.debug('Mapped entry:', entry);
          })
          .on('end', () => {
            this.logger.log(`Successfully parsed ${results.length} entries from stdout.`);
            if (results.length === 0 && stdout.trim().length > 0) {
                this.logger.warn(`Parsing finished with 0 results, but stdout was not empty. Check CSV headers/format and parsing logic.`);
                // Raw output was already logged earlier
            }
            resolve(results);
          })
          .on('error', (error) => {
            this.logger.error(`Error parsing CSV data from stdout:`, error);
            // Raw output was already logged earlier
            reject(new InternalServerErrorException('Failed to parse leaderboard CSV data from command output.'));
          });
      });

    } catch (error) {
        // --- Error Handling (keep as is) ---
        this.logger.error(`Error executing Kaggle CLI or processing output for ${competitionSlug}:`, error);
        const errorOutput = error.stdout || '';
        const errorStderr = error.stderr || '';
        this.logger.error(`Kaggle CLI stdout on error: ${errorOutput}`);
        this.logger.error(`Kaggle CLI stderr on error: ${errorStderr}`);
        // ... (rest of error handling) ...
         if (errorStderr.includes('404 - Not Found') || errorOutput.includes('404 - Not Found')) {
            throw new NotFoundException(`Competition slug '${competitionSlug}' not found on Kaggle or leaderboard is not available.`);
          }
          if (errorStderr.includes('401 - Unauthorized') || errorOutput.includes('401 - Unauthorized') || errorStderr.includes('Authentication credentials were not provided')) {
              throw new InternalServerErrorException('Kaggle API authentication failed. Ensure kaggle.json is correctly set up and has permissions.');
          }
           if (errorStderr.includes('403 - Forbidden') || errorOutput.includes('403 - Forbidden')) {
               // Check for rules acceptance message specifically
               if (errorStderr.includes('make sure you\'ve accepted the rules') || errorOutput.includes('make sure you\'ve accepted the rules')) {
                    throw new InternalServerErrorException(`Forbidden: Please accept the rules for the competition '${competitionSlug}' on the Kaggle website first.`);
               }
              throw new InternalServerErrorException('Kaggle API Forbidden (403). Check API token validity or competition rules acceptance.');
          }
           if (errorStderr.includes('command not found') || errorStderr.includes('is not recognized as an internal or external command')) {
               throw new InternalServerErrorException('Kaggle CLI command not found. Ensure it is installed and in the system PATH.');
           }
           // Catch the specific error we saw before, just in case 'view -s' also triggers it sometimes
           if (errorOutput.includes('Either --show or --download must be specified')) {
               throw new InternalServerErrorException('Kaggle CLI error: "Either --show or --download must be specified". This is unexpected with "view -s". Check Kaggle CLI version or installation.');
           }

          // General error fallback
          throw new InternalServerErrorException(`Failed to get leaderboard for '${competitionSlug}'. CLI Error: ${error.message}`);
    }
  }
}