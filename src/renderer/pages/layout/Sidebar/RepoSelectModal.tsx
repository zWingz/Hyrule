import React, { PureComponent } from 'react'
import { GitRepo } from '../../../http/types'
import { Modal, Checkbox } from 'antd'

const { Group } = Checkbox

interface Prop {
  visible: boolean
  repos: GitRepo[]
  value: GitRepo[]
  disabled: GitRepo[]
  onCancel?: () => void
  onConfirm?: (value: GitRepo[]) => void
}

interface State {
  value: string[]
  options: { name: string, disabled: boolean}[]
}

export class RepoSelectModal extends PureComponent<Prop, State> {
  state: State = {
    value: [],
    options: []
  }
  getOptions() {
    const { repos } = this.props
    const disabled = this.props.disabled.map(each => each.name)
    return repos.map(each => ({
      name: each.name,
      disabled: disabled.includes(each.name)
    }))
  }
  componentDidUpdate(prevProps: Prop) {
    if(!prevProps.visible && this.props.visible) {
      this.setState({
        value: this.props.value.map(each => each.name),
        options: this.getOptions()
      })
    }
  }
  onChange = (value: string[]) => {
    this.setState({
      value
    })
  }
  onOk = () => {
    this.props.onConfirm(this.props.repos.filter(each => this.state.value.includes(each.name)))
  }
  render() {
    const { visible, onCancel } = this.props
    const { value, options } = this.state
    return (
      <Modal
        title='选择仓库'
        visible={visible}
        onCancel={onCancel}
        onOk={this.onOk}
        destroyOnClose>
        <Group value={value} onChange={this.onChange} className='repos-select'>
          {options.map(each => (
            <Checkbox className='repos-select-item' value={each.name} key={each.name} disabled={each.disabled}>
              {each.name}
            </Checkbox>
          ))}
        </Group>
      </Modal>
    )
  }
}
