import 'dotenv/config';

const Email = process.env.Email || '';
const Password = process.env.Password || '';
const Host = process.env.Host || '';

export { Email, Password, Host };
