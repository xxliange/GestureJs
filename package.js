var version = '1.0.1';

Package.describe({
  name: 'nolimits4web:swiper',
  summary: 'iDangero.us Swiper - mobile touch slider with hardware accelerated transitions and native behavior',
  version: version,
  git: 'https://github.com/xxliange/GestureJs'
});

Package.onUse(function (api) {
  api.versionsFrom('1.1.0.2');

  api.addFiles([
    'build/gesture.min.js',
    'build/gesture.min.css'
    ], ['client']
  );
});

Package.onTest(function (api) {});
