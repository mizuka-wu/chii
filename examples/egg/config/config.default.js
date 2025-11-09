module.exports = appInfo => {
  const config = {};

  config.keys = appInfo.name + '_chii_egg_example';

  config.security = {
    csrf: {
      enable: false,
    },
  };

  config.logger = {
    consoleLevel: 'INFO',
  };

  config.cluster = {
    listen: {
      port: 7001,
      hostname: '127.0.0.1',
    },
  };

  config.chii = {
    basePath: '/chii/',
  };

  return config;
};
