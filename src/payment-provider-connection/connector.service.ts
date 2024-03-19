import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';

@Injectable()
export class ConnectorService {
  constructor(private readonly httpService: HttpService) {}

  /**
   * Sends a request to the specified endpoint with the provided data.
   * @param endpoint The endpoint to send the request to.
   * @param data The data to send with the request.
   * @returns An Observable that emits the AxiosResponse object.
   */
  send(endpoint: string, data: any): Observable<AxiosResponse> {
    return this.httpService.post(`http://localhost:7000/${endpoint}`, data);
  }
}
