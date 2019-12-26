module.exports = {
  productName: 'Hyrule',
  appId: 'com.zWing.Hyrule',
  directories: {
    output: 'package'
  },
  files: ['dist/**/*'],
  copyright: 'Copyright © 2019 zWing',
  asar: true,
  artifactName: '${productName}-${version}.${ext}',
  // compression: 'maximum',
  dmg: {
    contents: [
      {
        x: 410,
        y: 150,
        type: 'link',
        path: '/Applications'
      },
      {
        x: 130,
        y: 150,
        type: 'file'
      }
    ]
  },
  mac: {
    icon: 'build/icons/icon.png'
  },
  win: {
    icon: 'build/icons/icon.png',
    target: 'nsis',
    legalTrademarks: 'Eyas Personal'
  },
  nsis: {
    allowToChangeInstallationDirectory: true,
    oneClick: false,
    menuCategory: true,
    allowElevation: false
  },
  linux: {
    icon: 'build/icons'
  },
  electronDownload: {
    mirror: 'http://npm.taobao.org/mirrors/electron/'
  }
}
