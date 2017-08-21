const { resolve } = require('path')
const r = path => resolve(__dirname, path)

require('babel-core/register')({
  'presets': [
    'stage-3',
    'latest-node'
  ],
  'plugins': [
    'transform-decorators-legacy',
    [
      'module-alias',[
        {
          src: r('./server'), 'expose': '~',
          src: r('./server/database'), 'expose': 'database',
          src: r('./server/demo-decorator/decorator.js'), 'expose': 'decorator'
        }
      ]
    ]
  ]
})

require('babel-polyfill')
require('./server')
