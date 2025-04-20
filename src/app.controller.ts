import { Controller, Get, Param, Post, ParseFilePipe, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { AppService, LeaderboardEntry } from './app.service'; // Import LeaderboardEntry

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Update the GET route to accept a slug parameter
  // Example URL: /leaderboard/titanic
  @Get('leaderboard/:slug')
  async getLeadBoard(@Param('slug') slug: string): Promise<LeaderboardEntry[]> {
    // Input validation (basic) - ensure slug is provided
    if (!slug || typeof slug !== 'string' || slug.trim() === '') {
        throw new NotFoundException('Competition slug must be provided in the URL.');
    }
    // The service method now returns a Promise, so use await
    // Exceptions thrown by the service (NotFound, InternalServer) will be handled by NestJS
    return await this.appService.getLeadBoard(slug.trim());
  }

  // Keep your POST route if needed
  @Post('teamname') // Give it a more specific path
  setTeamName(): string {
    return this.appService.setTeamName();
  }
}
