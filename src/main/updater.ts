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
  const needUpdate = semver.gt(remoteVersion, version)
  if(needUpdate) {
    dialog.showMessageBox({
      type: 'info',
      title: '发现新版本',
      buttons: ['Yes', 'No'],
      message: `发现新版本${remoteVersion}，是否去下载最新的版本?`,
    }, res => {
      if (res === 0) {
        shell.openExternal(downloadUrl)
      }
    })
    return
  }
  dialog.showMessageBox({
    type: 'info',
    title: '检查更新',
    message: `目前为最新版本, 不需要更新！`
  })
}
