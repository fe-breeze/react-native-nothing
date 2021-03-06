import React, { Component } from 'react';
import { observable, action, runInAction, computed, autorun } from 'mobx';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Platform,
    PixelRatio,
    ScrollView,
    ListView,
    WebView,
    Image
} from 'react-native';
import HTMLView from 'react-native-htmlview';
import { Flex, WhiteSpace, WingBlank, Icon, Grid, Button, List, Toast, Modal } from 'antd-mobile';
import { inject, observer } from 'mobx-react/native';
import BaseComponent from '../../BaseComponent'
import { format } from '../../../util/tool';

const Item = List.Item;
const Brief = Item.Brief;

@inject('User', 'Common', 'Base', 'True')
@observer
export default class Index extends BaseComponent {

    static navigationOptions = ({ navigation }) => ({
        title: '公告详情'
    });

    componentWillMount() {
        const { True } = this.props;
        const { noticeItem, noticeDetailApiAction, alertsSubmitApiAction, noticeListApiAction } = True;
        noticeDetailApiAction(noticeItem.alert_tbl_id);
        if (noticeItem.status == '0') {
            alertsSubmitApiAction(noticeItem.alert_tbl_id);
            noticeListApiAction();
        }
    }

    componentWillUnmount() {
        const { True } = this.props;
        True.noticeDetailData = {};
    }

    render() {
        let { create_time, title, url, description } = this.props.True.noticeDetailData;
        return (
            <View style={styles.container}>
                <WhiteSpace size="lg"/>

                <WingBlank size='lg'>
                    <Flex>
                        <Flex.Item>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000', textAlign: 'center' }}>
                                {title}
                            </Text>
                        </Flex.Item>
                    </Flex>
                </WingBlank>

                <WhiteSpace size="lg"/>

                <WingBlank size='lg'>
                    <Flex>
                        <Flex.Item>
                            <Text style={{ fontSize: 16, color: '#666', textAlign: 'center' }}>
                                {create_time && format(create_time, 'yyyy-MM-dd hh:mm')}
                            </Text>
                        </Flex.Item>
                    </Flex>
                </WingBlank>

                <WhiteSpace size="lg"/>

                <WebView
                    source={{ html: description }}
                    scalesPageToFit={true}
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    brief: {
        height: 66,
        fontSize: 14,
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});

