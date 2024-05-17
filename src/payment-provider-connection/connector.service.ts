import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';

/**
 * Service for connecting to the payment provider.
 */
@Injectable()
export class ConnectorService {
  private paymentProvider: string;
  constructor(
    private readonly logger: Logger,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.paymentProvider = this.configService.get<string>(
      'PAYMENT_PROVIDER_URL',
      'localhost:3000',
    );
  }

  /**
   * Sends a request to the- in the env specified endpoint - with the provided data.
   * @param data The data to send with the request.
   * @returns An Observable that emits the AxiosResponse object.
   * @throws An error if the request fails.
   */
  async send(data: any): Promise<AxiosResponse> {
    try {
      const response = await this.httpService
        .post(this.paymentProvider, data)
        .toPromise(); // Convert Observable to Promise

      if (!response) {
        throw new Error('No response received from request');
      }
      if (response.status < 200 || response.status > 299) {
        this.logger.error(
          `Request to ${this.paymentProvider} failed with status ${response.status}`,
        );
      }
      return response;
    } catch (error) {
      this.logger.error(`Error sending request to ${this.paymentProvider}: ${error}`);
      throw error;
    }
  }
}
