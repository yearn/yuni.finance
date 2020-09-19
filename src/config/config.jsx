import example from "./example.config";
const env = process.env.APP_ENV || 'example';

const config = {
  example
};

export default config[env];
