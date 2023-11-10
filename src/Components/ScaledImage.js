import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Image, Dimensions } from 'react-native'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

const ScaledImage = (props) => {
    const [source, setSource] = useState({ uri: props.uri })
    const styles = props.style ? props.style : {} // 定义其他样式
    // 为了区分宽度/高度必要性，width 和 height prop 我们单独传，若有其他样式要求可传给styleProp

    useEffect(() => {
        Image.getSize(props.uri, (width, height) => {
            if (props.width && !props.height) { // 图片宽度固定，高度自适应
                setSource({ uri: props.uri, width: props.width, height: height * (props.width / width) });
            } else if (!props.width && props.height) { // 图片高度固定，宽度自适应
                setSource({ uri: props.uri, width: width * (props.height / height), height: props.height });
            } else if (!props.width && !props.height) { // 图片宽高都没有传，那就是宽度占满容器，高度自适应
                setSource({ uri: props.uri, width: '100%', height: Math.floor(screenWidth / width * height) });
            } else { // 图片宽高都传了
                setSource({ uri: props.uri, width: props.width, height: props.height });
            }
        });
    }, [])

    const imageStyle = {
        width: source.width,
        height: source.height,
        ...styles,
    }
    return <Image source={{ uri: source.uri }} style={imageStyle} />
}

ScaledImage.propTypes = {
    uri: PropTypes.string.isRequired,
    width: PropTypes.number,
    height: PropTypes.number
}

export default ScaledImage