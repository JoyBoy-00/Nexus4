import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';
import { UpdateDashboardConfigDto } from './dto/update-dashboard-config.dto';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats(@Req() req) {
    const userId = req.user?.userId;
    return this.dashboardService.getDashboardStats(userId);
  }

  @Get('config')
  async getConfig(@Req() req) {
    const userId = req.user?.userId;
    return this.dashboardService.getDashboardConfig(userId);
  }

  @Put('config')
  async updateConfig(@Req() req, @Body() dto: UpdateDashboardConfigDto) {
    const userId = req.user?.userId;
    return this.dashboardService.upsertDashboardConfig(userId, dto);
  }
}
