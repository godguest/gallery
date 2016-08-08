require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
import ReactDOM from 'react-dom';

// 获取图片相关数据
let imageDatas = require('../data/imageDatas.json');

// 利用自执行函数，将图片名信息转成图片URL路径信息
imageDatas = (imageDatasArr => {
  for (let i = 0, j = imageDatasArr.length; i < j; i++) {
    let singleImageData = imageDatasArr[i];
    singleImageData.imageURL = require('../images/' + singleImageData.fileName);
    imageDatasArr[i] = singleImageData;
  }
  return imageDatasArr;
})(imageDatas);

// 获取区间内的一个随机值
function getRangeRandom (low, high) {
  return Math.round(Math.random() * (high - low)) + low;
}

// 获取 -30°~30° 之间的一个随机值
function get30DegRandom() {
  // return (Math.random() > 0.5 ? '' : '-') + Math.ceil(Math.random() * 30);
  return getRangeRandom(-30, 30);
}

// 图片组件
class ImgFigure extends React.Component {
  // 点击处理函数
  handleClick = e => {
    // 如果点击的是当前居中的图片，则翻转图片，否则将对应的图片居中
    if (this.props.arrange.isCenter) {
      this.props.inverse();
    } else {
      this.props.center();
    }
    e.preventDefault();
    e.stopPropagation();
  }

  render() {
    let styleObj = {};

    // 如果 props 属性中指定了这张图片的位置，则使用
    if (this.props.arrange.pos) {
      styleObj = this.props.arrange.pos;
    }

    // 如果 props 属性中指定了这张图片的旋转角度，且不为0，则添加
    if (this.props.arrange.rotate) {
      (['Moz', 'Webkit', 'ms', 'O', '']).forEach(value => {
        styleObj[value + 'transform'] = 'rotate(' + this.props.arrange.rotate + 'deg)';
      });
    }

    if (this.props.arrange.isCenter) {
      styleObj.zIndex = 11;
    }

    let imgFigureClassName = 'img-figure';
    imgFigureClassName += this.props.arrange.isInverse ? ' is-inverse' : '';

    return (
      <figure className={imgFigureClassName} style={styleObj} onClick={this.handleClick}>
        <img src={this.props.data.imageURL} alt={this.props.data.title} />
        <figcaption>
          <h2 className="img-title">{this.props.data.title}</h2>
          <div className="img-back" onClick={this.handleClick}>
            <p>{this.props.data.desc}</p>
          </div>
        </figcaption>
      </figure>
    );
  }
}

// 控制组件
class ControllerUnit extends React.Component {
  // 点击处理函数
  handleClick = e => {
    if (this.props.arrange.isCenter) {
      this.props.inverse();
    } else {
      this.props.center();
    }
    e.preventDefault();
    e.stopPropagation();
  }

  render() {
    let controllerUnitClassName = 'controller-unit';

    // 如果对应的是居中的图片，显示控制按钮的居中态
    if (this.props.arrange.isCenter) {
      controllerUnitClassName += ' is-center';
      // 如果同时对应的是翻转图片，显示控制按钮的翻转态
      if (this.props.arrange.isInverse) {
        controllerUnitClassName += ' is-inverse';
      }
    }

    return (
      <span className={controllerUnitClassName} onClick={this.handleClick}></span>
    );
  }
}

class AppComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      imgsArrangeArr: [
        // {
        //  pos: {
        //    left: '0',
        //    top: '0'
        //  },
        //  rotate: 0,
        //  isInverse: false,
        //  isCenter: false
        // }
      ]
    };

    this.position = {
      centerPos: {
        left: 0,
        right: 0
      },
      // 水平方向的取值范围
      hPosRange: {
        leftSecX: [0, 0],
        rightSecX: [0, 0],
        y: [0, 0]
      },
      // 垂直方向的取值范围
      vPosRange: {
        x: [0, 0],
        topY: [0, 0]
      }
    };
  }

  /**
   * 重新布局所有图片
   * @param centerIndex 指定居中排布哪个图片
   */
  rearrange(centerIndex) {
    let imgsArrangeArr = this.state.imgsArrangeArr,
        position = this.position,
        centerPos = position.centerPos,
        hPosRange = position.hPosRange,
        vPosRange = position.vPosRange,
        hPosRangeLeftSecX = hPosRange.leftSecX,
        hPosRangeRightSecX = hPosRange.rightSecX,
        hPosRangeY = hPosRange.y,
        vPosRangeX = vPosRange.x,
        vPosRangeTopY = vPosRange.topY,
        imgsArrangeCenterArr = [],
        imgsArrangeTopArr = [],
        topImgNum = 0,
        topImgSpliceIndex = 0;

    // 居中 centerIndex 的图片，居中的图片不需要旋转
    imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex, 1);
    imgsArrangeCenterArr[0] = {
      pos: centerPos,
      rotate: 0,
      isCenter: true
    };

    // 上侧区域图片最多取一个
    topImgNum = Math.round(Math.random());
    // 布局上侧区域图片
    if (topImgNum) {
      topImgSpliceIndex = Math.floor(Math.random() * (imgsArrangeArr.length - topImgNum));
      imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex, topImgNum);
      imgsArrangeTopArr.forEach((value, index) => {
        imgsArrangeTopArr[index] = {
          pos: {
            left: getRangeRandom(vPosRangeX[0], vPosRangeX[1]),
            top: getRangeRandom(vPosRangeTopY[0], vPosRangeTopY[1])
          },
          rotate: get30DegRandom(),
          isCenter: false
        };
      });
    }

    // 布局左右两侧区域图片
    for (let i = 0, j = imgsArrangeArr.length, k = j / 2; i < j; i++) {
      let hPosRangeLORX = null;
      // 前半部分布局左侧，后半部分布局右侧
      if (i < k) {
        hPosRangeLORX = hPosRangeLeftSecX;
      } else {
        hPosRangeLORX = hPosRangeRightSecX;
      }
      imgsArrangeArr[i] = {
        pos: {
          left: getRangeRandom(hPosRangeLORX[0], hPosRangeLORX[1]),
          top: getRangeRandom(hPosRangeY[0], hPosRangeY[1])
        },
        rotate: get30DegRandom(),
        isCenter: false
      };
    }

    if (imgsArrangeTopArr && imgsArrangeTopArr[0]) {
      imgsArrangeArr.splice(topImgSpliceIndex, 0, imgsArrangeTopArr[0]);
    }

    imgsArrangeArr.splice(centerIndex, 0, imgsArrangeCenterArr[0]);

    this.setState({
      imgsArrangeArr: imgsArrangeArr
    });
  }

  /**
   * 翻转图片
   * @param index 当前被执行翻转操作的图片对应的图片信息数组的 index 值
   * @return {Function} 闭包函数，真正待被执行的函数
   */
  inverse(index) {
    return () => {
      let imgsArrangeArr = this.state.imgsArrangeArr;

      imgsArrangeArr[index].isInverse = !imgsArrangeArr[index].isInverse;

      this.setState({
        imgsArrangeArr: imgsArrangeArr
      });
    };
  }

  /**
   * 利用 rearrange 函数，居中对应 index 的图片
   * @param index 当前要被居中的图片对应的图片信息数组的 index 值
   * @return {Function}
   */
  center(index) {
    return () => {
      this.rearrange(index);
    };
  }

  // 组件加载以后，为每张图片计算其位置的范围
  componentDidMount() {
    // 首先拿到舞台的大小
    let stageDOM = ReactDOM.findDOMNode(this.refs.stage),
        stageW = stageDOM.scrollWidth,
        stageH = stageDOM.scrollHeight,
        halfStageW = Math.floor(stageW / 2),
        halfStageH = Math.floor(stageH / 2);

    // 拿到一个 imageFigure 的大小
    let imgFigureDOM = ReactDOM.findDOMNode(this.refs.imgFigure0),
        imgW = imgFigureDOM.scrollWidth,
        imgH = imgFigureDOM.scrollHeight,
        halfImgW = Math.floor(imgW / 2),
        halfImgH = Math.floor(imgH / 2);

    // 计算中心图片的位置点
    this.position.centerPos = {
      left: halfStageW - halfImgW,
      top: halfStageH - halfImgH
    };

    // 计算左侧、右侧区域图片排布位置的取值范围
    this.position.hPosRange.leftSecX[0] = -halfImgW;
    this.position.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;
    this.position.hPosRange.rightSecX[0] = halfStageW + halfImgW;
    this.position.hPosRange.rightSecX[1] = stageW - halfImgW;
    this.position.hPosRange.y[0] = -halfImgH;
    this.position.hPosRange.y[1] = stageH - halfImgH;

    // 计算上侧区域图片排布位置的取值范围
    this.position.vPosRange.x[0] = halfStageW - imgW;
    this.position.vPosRange.x[1] = halfStageW;
    this.position.vPosRange.topY[0] = -halfImgH;
    this.position.vPosRange.topY[1] = halfStageH - halfImgH * 3;

    this.rearrange(0);
  }

  render() {
    let controllerUnits = [],
        imgFigures = [];

    imageDatas.forEach((value, index) => {
      if (!this.state.imgsArrangeArr[index]) {
        this.state.imgsArrangeArr[index] = {
          pos: {
            left: 0,
            top: 0
          },
          rotate: 0,
          isInverse: false,
          isCenter: false
        };
      }

      imgFigures.push(<ImgFigure data={value} key={index} ref={'imgFigure' + index} arrange={this.state.imgsArrangeArr[index]} inverse={this.inverse(index)} center={this.center(index)} />);

      controllerUnits.push(<ControllerUnit key={index} arrange={this.state.imgsArrangeArr[index]} inverse={this.inverse(index)} center={this.center(index)} />);
    });

    return (
      <div className="stage" ref="stage">
        <section className="img-sec">
          {imgFigures}
        </section>
        <nav className="controller-nav">
          {controllerUnits}
        </nav>
      </div>
    );
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;
