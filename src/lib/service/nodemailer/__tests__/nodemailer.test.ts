import { sendEmail } from '../nodemailer';
import nodemailer from 'nodemailer';

// Mock nodemailer
jest.mock('nodemailer');

const mockNodemailer = nodemailer as jest.Mocked<typeof nodemailer>;

describe('nodemailer service', () => {
  let mockTransporter: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock transporter
    mockTransporter = {
      sendMail: jest.fn(),
    };
    
    mockNodemailer.createTransporter.mockReturnValue(mockTransporter);

    // Mock environment variables
    process.env.NODEMAILER_SERVICE = 'gmail';
    process.env.NODEMAILER_EMAIL = 'test@example.com';
    process.env.NODEMAILER_PASS = 'testpassword';
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.NODEMAILER_SERVICE;
    delete process.env.NODEMAILER_EMAIL;
    delete process.env.NODEMAILER_PASS;
  });

  describe('sendEmail', () => {
    it('should create transporter with correct configuration', async () => {
      mockTransporter.sendMail.mockImplementation((options, callback) => {
        callback(null, { messageId: 'test-id' });
      });

      await sendEmail('sender@example.com', 'John Doe', 'Test message');

      expect(mockNodemailer.createTransporter).toHaveBeenCalledWith({
        service: 'gmail',
        secure: false,
        auth: {
          user: 'test@example.com',
          pass: 'testpassword',
        },
      });
    });

    it('should send email with correct mail options', async () => {
      mockTransporter.sendMail.mockImplementation((options, callback) => {
        callback(null, { messageId: 'test-id' });
      });

      await sendEmail('sender@example.com', 'John Doe', 'Test message');

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        {
          from: 'test@example.com',
          to: 'test@example.com',
          subject: 'Contact sur Sudfa',
          text: 'Nouveau message de John Doe \n Email: sender@example.com \n Message: Test message',
        },
        expect.any(Function)
      );
    });

    it('should return true when email is sent successfully', async () => {
      mockTransporter.sendMail.mockImplementation((options, callback) => {
        callback(null, { messageId: 'test-id' });
      });

      const result = await sendEmail('sender@example.com', 'John Doe', 'Test message');

      expect(result).toBe(true);
    });

    it('should return false when email sending fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockTransporter.sendMail.mockImplementation((options, callback) => {
        callback(new Error('SMTP Error'), null);
      });

      const result = await sendEmail('sender@example.com', 'John Doe', 'Test message');

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to send email: ', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('should handle special characters in email content', async () => {
      mockTransporter.sendMail.mockImplementation((options, callback) => {
        callback(null, { messageId: 'test-id' });
      });

      const result = await sendEmail(
        'jean.françois@example.com',
        'Jean-François Müller',
        'Message avec des accents: àéèêë et symboles & caractères spéciaux!'
      );

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Nouveau message de Jean-François Müller \n Email: jean.françois@example.com \n Message: Message avec des accents: àéèêë et symboles & caractères spéciaux!',
        }),
        expect.any(Function)
      );
    });

    it('should handle very long messages', async () => {
      mockTransporter.sendMail.mockImplementation((options, callback) => {
        callback(null, { messageId: 'test-id' });
      });

      const longMessage = 'A'.repeat(5000);
      const result = await sendEmail('sender@example.com', 'John Doe', longMessage);

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: `Nouveau message de John Doe \n Email: sender@example.com \n Message: ${longMessage}`,
        }),
        expect.any(Function)
      );
    });

    it('should handle FormDataEntryValue types correctly', async () => {
      mockTransporter.sendMail.mockImplementation((options, callback) => {
        callback(null, { messageId: 'test-id' });
      });

      // FormDataEntryValue can be string or File
      const emailValue: FormDataEntryValue = 'test@example.com';
      const nameValue: FormDataEntryValue = 'John Doe';
      const messageValue: FormDataEntryValue = 'Test message';

      const result = await sendEmail(emailValue, nameValue, messageValue);

      expect(result).toBe(true);
    });

    it('should use environment variables for transporter configuration', async () => {
      process.env.NODEMAILER_SERVICE = 'yahoo';
      process.env.NODEMAILER_EMAIL = 'different@example.com';
      process.env.NODEMAILER_PASS = 'differentpassword';

      mockTransporter.sendMail.mockImplementation((options, callback) => {
        callback(null, { messageId: 'test-id' });
      });

      await sendEmail('sender@example.com', 'John Doe', 'Test message');

      expect(mockNodemailer.createTransporter).toHaveBeenCalledWith({
        service: 'yahoo',
        secure: false,
        auth: {
          user: 'different@example.com',
          pass: 'differentpassword',
        },
      });

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'different@example.com',
          to: 'different@example.com',
        }),
        expect.any(Function)
      );
    });

    it('should handle SMTP authentication errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockTransporter.sendMail.mockImplementation((options, callback) => {
        const authError = new Error('Invalid login');
        authError.name = 'AuthenticationError';
        callback(authError, null);
      });

      const result = await sendEmail('sender@example.com', 'John Doe', 'Test message');

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to send email: ', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('should handle network timeout errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockTransporter.sendMail.mockImplementation((options, callback) => {
        const timeoutError = new Error('Connection timeout');
        timeoutError.name = 'TimeoutError';
        callback(timeoutError, null);
      });

      const result = await sendEmail('sender@example.com', 'John Doe', 'Test message');

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to send email: ', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('should handle empty string values', async () => {
      mockTransporter.sendMail.mockImplementation((options, callback) => {
        callback(null, { messageId: 'test-id' });
      });

      const result = await sendEmail('', '', '');

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Nouveau message de  \n Email:  \n Message: ',
        }),
        expect.any(Function)
      );
    });

    it('should format email text correctly with newlines', async () => {
      mockTransporter.sendMail.mockImplementation((options, callback) => {
        callback(null, { messageId: 'test-id' });
      });

      await sendEmail('test@example.com', 'John Doe', 'Multi\nline\nmessage');

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Nouveau message de John Doe \n Email: test@example.com \n Message: Multi\nline\nmessage',
        }),
        expect.any(Function)
      );
    });
  });
});