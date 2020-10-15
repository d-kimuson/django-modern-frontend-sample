module.exports = {
  sourceMap: true,
  plugins: [
    require('autoprefixer')({
      grid: "autoplace"
    }),
    require('postcss-flexbugs-fixes')({}),
    require('cssnano')({ preset: 'default' }),
  ]
}
