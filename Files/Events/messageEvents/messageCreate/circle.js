const Circle = require('../../../BaseClient/CircleAPI');

const Shape = new Circle();

module.exports = async (msg) => {
  if (msg.channel.id !== '736278082406842389') return;

  const userExistsInShape = await Shape.getUser(msg.author.id);
    if (!userExistsInShape) await Shape.

};
