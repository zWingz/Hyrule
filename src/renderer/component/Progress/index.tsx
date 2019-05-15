import React, { PureComponent } from 'react'
import cls from 'classnames'
import './style.less'

interface Prop {
  width?: number
  strokeWidth?: number
  percentage?: number
  backgroundColor?: string
  progressColor?: string
  className?: string
}
export class Progress extends PureComponent<Prop> {
  static defaultProps = {
    backgroundColor: 'hsla(0,0%,100%,.4)',
    progressColor: '#fff',
    strokeWidth: 6,
    width: 100
  }
  get relativeStrokeWidth() {
    const { strokeWidth, width } = this.props
    return ((strokeWidth / width) * 100).toFixed(1)
  }
  get circle() {
    const radius = 50 - parseFloat(this.relativeStrokeWidth) / 2
    return {
      cx: 50,
      cy: 50,
      r: radius,
      strokeWidth: this.relativeStrokeWidth,
      fill: 'none'
    }
  }
  // 周长 l = 2πr
  get perimeter() {
    const radius = 50 - parseFloat(this.relativeStrokeWidth) / 2
    return 2 * Math.PI * radius
  }
  get circlePathStyle() {
    const perimeter = this.perimeter * this.props.percentage / 100
    return {
      // svg的虚线数组,表示虚线的长度
      strokeDasharray: `${perimeter}px,${this.perimeter}px`,
      // svg的虚线偏移
      // strokeDashoffset: (1 - +this.props.percentage / 100) * perimeter + 'px',
      transition: 'all 0.6s ease'
    }
  }
  render() {
    const { circle, circlePathStyle } = this
    const {
      backgroundColor,
      progressColor,
      width,
      percentage,
      className
    } = this.props
    return (
      <div
        className={cls('progress', className)}
        style={{ width: width + 'px', height: width + 'px' }}>
        <svg viewBox='0 0 100 100'>
          <circle {...circle} stroke={backgroundColor} />
          <circle
            {...circle}
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
        <div className='progress-text'>{percentage}%</div>
      </div>
    )
  }
}
