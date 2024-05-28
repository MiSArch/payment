import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { ConfigurationService } from 'src/configuration/configuration.service';

/**
 * Service for connecting to the payment provider.
 */
@Injectable()
export class ConnectorService {
  private paymentProvider: string;
  constructor(
    private readonly logger: Logger,
    private readonly httpService: HttpService,
    private readonly configService: ConfigurationService,
  ) {
    this.paymentProvider = this.configService.getCurrentVariableValue<string>(
      'PAYMENT_PROVIDER_URL',
      'localhost:3000',
    );
  }

  /**
   * Sends a request to the- in the env specified endpoint - with the provided data.
   * Retries if the request fails as often as specified on the environment.
   * @param endpoint The endpoint to send the request to.
   * @param data The data to send with the request.
   * @returns An Observable that emits the AxiosResponse object.
   * @throws An error if the request fails.
   */
  async send(data: any): Promise<AxiosResponse | undefined> {
    const retryCount = this.configService.getCurrentVariableValue('RETRY_COUNT', 3);
    let attempts = 0;
    do {
      try {
        const response = await this.httpService.post(this.paymentProvider, data).toPromise();
        if (!response || response.status < 200 || response.status > 299) {
          throw new Error(`Request to ${this.paymentProvider} failed with status ${response?.status}`);
        }
        return response;
      } catch (error) {
        this.logger.error(`Error sending request to ${this.paymentProvider}: ${JSON.stringify(error)}`);
        attempts++;
        // <= since first attempt is not a retry
        if (attempts <= retryCount) {
          this.logger.log(`Retrying request to ${this.paymentProvider} [${attempts}/${retryCount}]`);
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
    } while (attempts <= retryCount);
  }
}
