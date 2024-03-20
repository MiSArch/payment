import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';

@Injectable()
export class ConnectorService {
  constructor(private readonly httpService: HttpService) {}

  /**
   * Sends a request to the specified endpoint with the provided data.
   * @param endpoint The endpoint to send the request to.
   * @param data The data to send with the request.
   * @returns An Observable that emits the AxiosResponse object.
   * @throws An error if the request fails.
   */
  async send(endpoint: string, data: any): Promise<AxiosResponse> {
    try {
      const response = await this.httpService
        .post(`http://localhost:7000/${endpoint}`, data)
        .toPromise(); // Convert Observable to Promise
      if (response.status !== 200) {
        console.error(
          `Request to ${endpoint} failed with status ${response.status}`,
        );
      }
      return response;
    } catch (error) {
      console.error(`Error sending request to ${endpoint}:`, error);
      throw error;
    }
  }
}
