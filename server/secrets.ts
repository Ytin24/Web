export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const YANDEX_MAPS_API_KEY = process.env.YANDEX_MAPS_API_KEY;
export const JWT_SECRET = process.env.JWT_SECRET;
export const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
export const DATABASE_URL = process.env.DATABASE_URL;

const required = [
  ['OPENAI_API_KEY', OPENAI_API_KEY],
  ['YANDEX_MAPS_API_KEY', YANDEX_MAPS_API_KEY],
  ['JWT_SECRET', JWT_SECRET],
  ['DATABASE_URL', DATABASE_URL],
];

for (const [name, value] of required) {
  if (!value) {
    throw new Error(`Missing required secret: ${name}`);
  }
}