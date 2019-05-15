import React, { PureComponent } from 'react'

import './style.less'

interface Prop {
  width?: number
  strokeWidth?: number
  percentage?: number
  backgroundColor?: string
  progressColor?: string
}
export class Progress extends PureComponent<Prop> {
  static defaultProps = {
    backgroundColor: '#eceef9',
    progressColor: '#8894eb',
    strokeWidth: 8,
    width: 100
  }
  get relativeStrokeWidth() {
    const { strokeWidth, width } = this.props
    return ((strokeWidth / width) * 100).toFixed(1)
  }
  get path() {
    // 计算园的半径, 因为svg的viewBox为100 100, 所以50说明是画布的一半;
    // 因为绘制其实是圆的描边.所以在计算宽度还需要除2,才是圆的边缘
    // 50再减去进度条的宽度既是svg起点坐标
    const radius = 50 - parseFloat(this.relativeStrokeWidth) / 2
    /**
     * 将画笔移动到50 50的位置.相对该位置在Y轴上移动-radius位置.既到top center的位置
     * 画圆,半径raidus, 于x轴夹角0,大角度,顺时针到达相对于起点的0 2*半径.既bottom center
     * 继续画圆.此时起始位置变成bottom center.终点位置变成top center
     */
    // return `M 50 50 m 0 -${radius} a ${radius} ${radius} 0 1 1 0 ${radius *
    //   2} a ${radius} ${radius} 0 1 1 0 -${radius * 2}`

    // <circle cx="25" cy="75" r="20" stroke="red" fill="transparent" stroke-width="5"/>
    return {
      cx: 50,
      cy: 50,
      r: radius
    }
  }
  // 周长 l = 2πr
  get perimeter() {
    const radius = 50 - parseFloat(this.relativeStrokeWidth) / 2
    return 2 * Math.PI * radius
  }
  get circlePathStyle() {
    const perimeter = this.perimeter
    return {
      // svg的虚线数组,表示虚线的长度
      strokeDasharray: `${perimeter}px,${perimeter}px`,
      // svg的虚线偏移
      // strokeDashoffset: (1 - +this.props.percentage / 100) * perimeter + 'px',
      transition: 'stroke-dashoffset 0.6s ease 0s, stroke 0.6s ease'
    }
  }
  render() {
    const { path, relativeStrokeWidth, circlePathStyle } = this
    const { backgroundColor, progressColor, width } = this.props
    const common = {
      // d: path,
      ...this.path,
      strokeWidth: relativeStrokeWidth,
      fill: 'none'
    }
    return (
      <div
        className='progress'
        style={{ width: width + 'px', height: width + 'px' }}>
        <svg viewBox='0 0 100 100'>
          <circle {...common} stroke={backgroundColor} />
          <circle
            {...common}
            stroke={progressColor}
            style={circlePathStyle}
            strokeLinecap='round'
          />
          {/* <path {...common} stroke={backgroundColor} /> */}
          {/* <path
            {...common}
            stroke={progressColor}
            stroke-linecap='round'
            style={circlePathStyle}
          /> */}
        </svg>
      </div>
    )
  }
}
