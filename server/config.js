const config = {
  // mongoURL:
  //   process.env.MONGO_URL ||
  //   "mongodb+srv://weihanlim:abcd1234@cluster0.69grw.mongodb.net/invigilator_appointment?retryWrites=true&w=majority",
  mongoURL:
    process.env.MONGO_URL ||
    "mongodb+srv://bizbuzbiz:ivantehteh1@cluster0.wq1qi.mongodb.net/PEIA?retryWrites=true&w=majority",
  port: process.env.PORT || 8001,
  secret: `E8C$Hr8@vy!4#1fIl`,
  saltRounds: 10,
};

export default config;
