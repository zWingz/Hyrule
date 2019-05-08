module.exports = {
  // "babelrc": true,
  "presets": [
    "@babel/preset-react"
  ],
  "plugins": [
    [
      "import",
      {
        "libraryName": "antd",
        "libraryDirectory": "es",
        "style": "css"
      }
    ],
    // "@babel/plugin-syntax-dynamic-import",
    // "@babel/plugin-proposal-class-properties",
    // [
    //   "@babel/plugin-proposal-decorators",
    //   {
    //     "legacy": true
    //   }
    // ],
    // "@babel/plugin-proposal-object-rest-spread"
  ],
  "env": {
    "development": {
      "plugins": [
        "react-hot-loader/babel",
    // "@babel/plugin-proposal-object-rest-spread"
      ]
    }
  }
}
