import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Alert,
    Platform,
    TouchableHighlight,
    PixelRatio,
    Image
} from 'react-native';
import { Flex, WhiteSpace, Icon, Grid, Button, List, Result, Toast, Modal } from 'antd-mobile';

export const showAlert = ({
                              title = '提交',
                              massage = '确定修改信息吗',
                              okTxt = '确定',
                              okFn = () => {
                              },
                              cancelTxt = '取消',
                              cancelFn = () => {
                              }
                          }) => {
    Alert.alert(
        title,
        massage,
        [
            {
                text: cancelTxt,
                onPress: cancelFn,
            },
            {
                text: okTxt,
                onPress: okFn,
            },
        ]
    );
};