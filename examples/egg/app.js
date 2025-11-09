const registerChii = require('@mizuka-wu/chii/egg');

module.exports = app => {
  const options = app.config.chii || {};
  registerChii(app, options);
};
