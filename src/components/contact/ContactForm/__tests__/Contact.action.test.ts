import { contactFormAction } from '../Contact.action';
import { sendEmail } from '@/lib/service/nodemailer';
import { FormState } from '@/components/utils/Form';

// Mock du service sendEmail
jest.mock('@/lib/service/nodemailer', () => ({
  sendEmail: jest.fn(),
}));

const mockSendEmail = sendEmail as jest.MockedFunction<typeof sendEmail>;

describe('Contact.action', () => {
  let mockFormData: FormData;
  const initialState: FormState = {
    status: null,
    message: '',
  };

  beforeEach(() => {
    mockFormData = new FormData();
    mockSendEmail.mockClear();
  });

  describe('contactFormAction', () => {
    it('should return error if honeypot field is filled', async () => {
      mockFormData.append('name', 'John Doe');
      mockFormData.append('email', 'john@example.com');
      mockFormData.append('message', 'Test message');
      mockFormData.append('hp', 'bot-filled-value'); // Honeypot filled

      const result = await contactFormAction(initialState, mockFormData);

      expect(result).toEqual({
        status: 'error',
        message: 'Merci de remplir tous les champs',
      });
      expect(mockSendEmail).not.toHaveBeenCalled();
    });

    it('should return error if name is missing', async () => {
      mockFormData.append('email', 'john@example.com');
      mockFormData.append('message', 'Test message');

      const result = await contactFormAction(initialState, mockFormData);

      expect(result).toEqual({
        status: 'error',
        message: 'Merci de remplir tous les champs',
      });
      expect(mockSendEmail).not.toHaveBeenCalled();
    });

    it('should return error if email is missing', async () => {
      mockFormData.append('name', 'John Doe');
      mockFormData.append('message', 'Test message');

      const result = await contactFormAction(initialState, mockFormData);

      expect(result).toEqual({
        status: 'error',
        message: 'Merci de remplir tous les champs',
      });
      expect(mockSendEmail).not.toHaveBeenCalled();
    });

    it('should return error if message is missing', async () => {
      mockFormData.append('name', 'John Doe');
      mockFormData.append('email', 'john@example.com');

      const result = await contactFormAction(initialState, mockFormData);

      expect(result).toEqual({
        status: 'error',
        message: 'Merci de remplir tous les champs',
      });
      expect(mockSendEmail).not.toHaveBeenCalled();
    });

    it('should return error if all fields are empty', async () => {
      const result = await contactFormAction(initialState, mockFormData);

      expect(result).toEqual({
        status: 'error',
        message: 'Merci de remplir tous les champs',
      });
      expect(mockSendEmail).not.toHaveBeenCalled();
    });

    it('should return success if email is sent successfully', async () => {
      mockFormData.append('name', 'John Doe');
      mockFormData.append('email', 'john@example.com');
      mockFormData.append('message', 'This is a test message');
      
      mockSendEmail.mockResolvedValue(true);

      const result = await contactFormAction(initialState, mockFormData);

      expect(result).toEqual({
        status: 'ok',
        message: 'Merci pour votre message',
      });
      expect(mockSendEmail).toHaveBeenCalledWith(
        'john@example.com',
        'John Doe',
        'This is a test message'
      );
    });

    it('should return error if email sending fails', async () => {
      mockFormData.append('name', 'John Doe');
      mockFormData.append('email', 'john@example.com');
      mockFormData.append('message', 'This is a test message');
      
      mockSendEmail.mockResolvedValue(false);

      const result = await contactFormAction(initialState, mockFormData);

      expect(result).toEqual({
        status: 'error',
        message: 'Erreur lors de l\'envoi du message',
      });
      expect(mockSendEmail).toHaveBeenCalledWith(
        'john@example.com',
        'John Doe',
        'This is a test message'
      );
    });

    it('should handle email sending exception', async () => {
      mockFormData.append('name', 'John Doe');
      mockFormData.append('email', 'john@example.com');
      mockFormData.append('message', 'This is a test message');
      
      mockSendEmail.mockRejectedValue(new Error('SMTP error'));

      const result = await contactFormAction(initialState, mockFormData);

      expect(result).toEqual({
        status: 'error',
        message: 'Erreur lors de l\'envoi du message',
      });
    });

    it('should handle empty string values as missing fields', async () => {
      mockFormData.append('name', '');
      mockFormData.append('email', '');
      mockFormData.append('message', '');

      const result = await contactFormAction(initialState, mockFormData);

      expect(result).toEqual({
        status: 'error',
        message: 'Merci de remplir tous les champs',
      });
      expect(mockSendEmail).not.toHaveBeenCalled();
    });

    it('should handle whitespace-only values as missing fields', async () => {
      mockFormData.append('name', '   ');
      mockFormData.append('email', ' ');
      mockFormData.append('message', '  ');

      const result = await contactFormAction(initialState, mockFormData);

      expect(result).toEqual({
        status: 'error',
        message: 'Merci de remplir tous les champs',
      });
      expect(mockSendEmail).not.toHaveBeenCalled();
    });

    it('should accept valid form with special characters', async () => {
      mockFormData.append('name', 'Jean-François Müller');
      mockFormData.append('email', 'jean.françois+test@example.co.uk');
      mockFormData.append('message', 'Voici un message avec des accents: àéèêë & caractères spéciaux!');
      
      mockSendEmail.mockResolvedValue(true);

      const result = await contactFormAction(initialState, mockFormData);

      expect(result).toEqual({
        status: 'ok',
        message: 'Merci pour votre message',
      });
      expect(mockSendEmail).toHaveBeenCalledWith(
        'jean.françois+test@example.co.uk',
        'Jean-François Müller',
        'Voici un message avec des accents: àéèêë & caractères spéciaux!'
      );
    });

    it('should handle very long messages', async () => {
      const longMessage = 'A'.repeat(5000);
      mockFormData.append('name', 'John Doe');
      mockFormData.append('email', 'john@example.com');
      mockFormData.append('message', longMessage);
      
      mockSendEmail.mockResolvedValue(true);

      const result = await contactFormAction(initialState, mockFormData);

      expect(result).toEqual({
        status: 'ok',
        message: 'Merci pour votre message',
      });
      expect(mockSendEmail).toHaveBeenCalledWith(
        'john@example.com',
        'John Doe',
        longMessage
      );
    });

    it('should ignore the initial state parameter', async () => {
      const customInitialState: FormState = {
        status: 'error',
        message: 'Previous error',
      };

      mockFormData.append('name', 'John Doe');
      mockFormData.append('email', 'john@example.com');
      mockFormData.append('message', 'Test message');
      
      mockSendEmail.mockResolvedValue(true);

      const result = await contactFormAction(customInitialState, mockFormData);

      expect(result).toEqual({
        status: 'ok',
        message: 'Merci pour votre message',
      });
    });

    it('should handle FormData with File objects', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      mockFormData.append('name', 'John Doe');
      mockFormData.append('email', 'john@example.com');
      mockFormData.append('message', 'Test message');
      mockFormData.append('file', file); // Extra field should be ignored
      
      mockSendEmail.mockResolvedValue(true);

      const result = await contactFormAction(initialState, mockFormData);

      expect(result).toEqual({
        status: 'ok',
        message: 'Merci pour votre message',
      });
    });
  });
});