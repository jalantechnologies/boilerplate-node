exports.sayHello = (req, res) => {
  res.render('hello', {
    message: res.__('HELLO'),
  });
};
