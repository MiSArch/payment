import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';

/**
 * Service for connecting to the payment provider.
 */
@Injectable()
export class ConnectorService {
  private simulationEndpoint: string;
  constructor(
    private readonly logger: Logger,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,  
  ) {
    this.simulationEndpoint = this.configService.get<string>('SIMULATION_URL');
  }

  /**
   * Sends a request to the specified endpoint with the provided data.
   * @param endpoint The endpoint to send the request to.
   * @param data The data to send with the request.
   * @returns An Observable that emits the AxiosResponse object.
   * @throws An error if the request fails.
   */
  async send(endpoint: string, data: any): Promise<AxiosResponse> {
    try {
      if(!this.simulationEndpoint) {
        this.logger.error('Simulation URL not set');
        return null;
      }
      const response = await this.httpService
        .post(`${this.simulationEndpoint}/${endpoint}`, data)
        .toPromise(); // Convert Observable to Promise
      if (response.status !== 200) {
        this.logger.error(
          `Request to ${endpoint} failed with status ${response.status}`,
        );
      }
      return response;
    } catch (error) {
      this.logger.error(`Error sending request to ${endpoint}:`, error);
    }
  }
}
