import React, { PureComponent } from 'react'
import { octo, ImgType, DirType } from '../../utils/octokit'
import { RouterProps, RouteComponentProps } from 'react-router'

interface RouteProp {
  repo: string
}
type Prop = RouteComponentProps<RouteProp>
type State = {
  pathArr: string[]
  images: ImgType[]
  dir: DirType
  loading: boolean
  // error: string
  // modalShow: boolean
  // newPathName: string
  // edit: boolean
}
export class ImagesPage extends PureComponent<Prop, State> {
  state: State = {
    pathArr: [],
    images: [],
    dir: {},
    loading: true
    // modalShow: false,
    // newPathName: '',
    // edit: false
  }
  static getDerivedStateFromProps(nextProp: Prop) {
    octo.setRepo(nextProp.match.params.repo)
    return null
  }
  componentDidMount() {
    console.log('didMount', this.props.match.params.repo)
  }
  render() {
    return <div>{this.props.match.params.repo}</div>
  }
}
