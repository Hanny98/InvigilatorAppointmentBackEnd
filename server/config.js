const config = {
  mongoURL: process.env.MONGO_URL,
  port: process.env.PORT,
  secret: process.env.SECRET,
  saltRounds: 10,
};

export default config;
