import 'dotenv/config';

export default {
  schema: './src/common/config/models/**/*.schema.js',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
};