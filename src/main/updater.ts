import smver from 'semver'
import fetch from 'node-fetch'
import * as pkg from '../../package.json'
import * as semver from 'semver'
import { dialog, shell } from 'electron'
const url = 'https://raw.githubusercontent.com/zWingz/Hyrule/master/package.json'
const downloadUrl = 'https://github.com//zWingz/Hyrule/releases/latest'

export async function checkUpdate() {
  const { version } = pkg
  const remotePkg = await fetch(url).then(r => r.json())
  const { version: remoteVersion } = remotePkg
  const needUpdate = !semver.gt(remoteVersion, version)
  if(needUpdate) {
    dialog.showMessageBox({
      type: 'info',
      title: 'There are new version',
      buttons: ['Yes', 'No'],
      message: `Download the latest version(${remoteVersion}) now?`
    }, res => {
      if (res === 0) {
        shell.openExternal(downloadUrl)
      }
    })
    return
  }
  dialog.showMessageBox({
    type: 'info',
    title: 'Check update',
    message: `This is the latest version!`
  })
}
