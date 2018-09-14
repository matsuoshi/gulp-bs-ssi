const gulp = require('gulp');
const $ = require("gulp-load-plugins")();
const autoprefixer = require('autoprefixer');
const browserSync = require('browser-sync');
const ssi = require('browsersync-ssi');

const DIR = {
  base: 'public',
  src: {
    sass: 'src/styles'
  },
  dist: {
    sass: 'public/assets/css'
  }
};


// scss のビルド
function buildCSS(is_develop = false) {

  gulp.src(`${DIR.src.sass}/**/**.scss`)
    // 開発環境用のみ、sourcemap を出力する
    .pipe($.if(is_develop, $.sourcemaps.init()))
    .pipe($.plumber({
      errorHandler: $.notify.onError('Error: <%= error.message %>')
    }))
    .pipe($.sass({
      outputStyle: 'compressed'
    }))
    .pipe($.postcss([
      autoprefixer({
        browsers: [
          "last 2 versions",
          "ie >= 11",
          "Android >= 4.4"
        ],
        cascade: false
      })
    ]))
    .pipe($.if(is_develop, $.sourcemaps.write()))
    .pipe(gulp.dest(DIR.dist.sass))
}

// 本番環境用のビルド
gulp.task('build', (done) => {
  buildCSS();
  done();
});

// テスト環境用のビルド
gulp.task('build:dev', (done) => {
  buildCSS(true);
  done();
});


// サーバ起動 (browser-sync, SSI, watch SCSS)
gulp.task('serve', (done) => {
  // browser-sync + SSI
  browserSync({
    files: `${DIR.base}/**/*`,
    server: {
      baseDir: DIR.base,
      middleware: ssi({
        baseDir: DIR.base,
        ext: '.html'
      })
    },
    startPath: '/'
  });

  // watch SCSS
  gulp.watch(`${DIR.src.sass}/**/**.scss`, gulp.task('build:dev'));

  done();
});

// default
gulp.task('default', gulp.series('build:dev', 'serve', function(done) {
  done();
}));
