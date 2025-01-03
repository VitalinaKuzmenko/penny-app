import { Controller, Post, Body } from '@nestjs/common';

@Controller('csv')
export class CsvController {
  @Post('upload')
  handleCsvUpload(@Body() body: any): any {
    // Extract the parsed data from the body
    const { data } = body;

    // Validate data format
    if (!Array.isArray(data)) {
      return { message: 'Invalid data format. Expected an array of objects.' };
    }

    // Log the data for testing purposes
    console.log('Received Data:', data);

    // Respond with success
    return {
      message: 'CSV data received successfully!',
      receivedCount: data.length,
    };
  }
}
