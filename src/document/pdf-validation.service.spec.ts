import { Test, TestingModule } from '@nestjs/testing';
import { PdfValidationService } from './pdf-validation.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';

describe('PdfValidationService', () => {
  let service: PdfValidationService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PdfValidationService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue: any) => {
              if (key === 'MAX_PDF_SIZE_MB') return 10;
              if (key === 'MAX_PDF_PAGES') return 100;
              return defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<PdfValidationService>(PdfValidationService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validate', () => {
    it('should reject files that are too large', async () => {
      // Mock a buffer that exceeds the size limit (10MB)
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB
      
      await expect(service.validatePdf(largeBuffer)).rejects.toThrow(BadRequestException);
      await expect(service.validatePdf(largeBuffer)).rejects.toThrow(/excede o máximo permitido/);
    });

    it('should accept valid PDF files within size limits', async () => {
      // This test would require a valid PDF buffer
      // For a real test, you would need to load a small valid PDF file
      // Here we're just mocking the behavior
      
      // Mock the PDF.js and pdf-parse behavior for a valid PDF
      jest.spyOn(service as any, 'checkForMaliciousContent').mockResolvedValue(undefined);
      
      // Create a mock implementation for pdfjsLib.getDocument
      const mockPdfDocument = {
        numPages: 5,
        isEncrypted: false,
      };
      
      const mockLoadingTask = {
        promise: Promise.resolve(mockPdfDocument),
      };
      
      const pdfjsLib = require('pdfjs-dist');
      jest.spyOn(pdfjsLib, 'getDocument').mockReturnValue(mockLoadingTask);
      
      // Small valid buffer
      const validBuffer = Buffer.from('mock PDF content');
      
      // Should not throw an exception
      await expect(service.validatePdf(validBuffer)).resolves.not.toThrow();
    });

    // Additional tests could be added for:
    // - Encrypted PDFs
    // - PDFs with too many pages
    // - PDFs with malicious content
    // - Invalid/corrupted PDFs
  });
});
