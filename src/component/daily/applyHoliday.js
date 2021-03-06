/**
 * 申请假期
 */

import React, { Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    WebView,
} from 'react-native';

import HTMLView from 'react-native-htmlview';

import { RequireData } from '../personal/common/index';
import {
    List,
    Picker,
    DatePicker,
    ActionSheet,
    Icon,
    TextareaItem,
    WhiteSpace,
    Button,
    WingBlank,
    Toast
} from 'antd-mobile';
import { inject, observer } from 'mobx-react/native';
import { createForm } from 'rc-form';
import Base from '../../stores/Base'
import ShowConfirm from '../../component/ShowConfirm';
import ApprovingButton from '../personal/approvingButton';
import { format } from '../../common/Tool';
import ImgSelect from '../../component/ImgSelect';
import { isArrayFn } from '../../common/Tool';
import InputItem from '../InputItem';


@inject('User', 'Common', 'True')
@observer
class Index extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: '假期申请',
        }
    };

    constructor(props) {
        super(props);
        //判断传过来的add edit
        const { type } = this.props.navigation.state.params;
        let lv_type = '',
            descStr = '',
            userDefined = '', //用户定义字段
            begin_time = new Date(), //开始时间
            begin_time_half = ['AM'],
            end_time = new Date(),
            end_time_half = ['PM'],
            user_defined_field_1 = '',
            dur_days = '',
            remark = '', //请假原因
            doctor_certificate = '', //附件
            ifEdit = 0; //默认0：新增 1：修改
        if (type == 'edit') {
            const { selectLvDetail } = this.props.User;
            console.log(selectLvDetail)
            lv_type = [selectLvDetail.lv_type];
            begin_time = new Date(parseInt(selectLvDetail.begin_time));
            begin_time_half = [selectLvDetail.begin_time_half];
            end_time = new Date(parseInt(selectLvDetail.end_time));
            user_defined_field_1 = selectLvDetail.user_defined_field_1_value ? new Date(parseInt(selectLvDetail.user_defined_field_1_value)) : '';
            userDefined = selectLvDetail.user_defined_field_1_label;
            end_time_half = [selectLvDetail.end_time_half];
            dur_days = selectLvDetail.dur_days;
            remark = selectLvDetail.remark;
            doctor_certificate = selectLvDetail.doctor_certificate;
            ifEdit = 1;
            let { True } = this.props;
            True.selectTask = { function: 'LA', function_dtl: lv_type };
        }
        let imgArr = [];
        const doctorArr = doctor_certificate.split(',');
        doctorArr && doctorArr.map(info => {
            if (info != '') {
                imgArr.push({
                    uri: info,
                })
            }
        })
        this.state = {
            lv_type,
            descStr,
            userDefined, //用户定义字段
            begin_time, //开始时间
            begin_time_half,
            end_time,
            end_time_half,
            user_defined_field_1,
            dur_days,
            remark, //请假原因
            doctor_certificate,
            ifEdit,
            imgArr
        }
    }

    //选择图片
    onSelectImg = (imgArr) => {
        this.setState({
            imgArr,
        })
    }
    //进行数据调教
    onSubmit = () => {
        const { selectApprover } = this.props.True;
        //判断对应的必填字段是否填写
        const approver_id = selectApprover.value;

        const { imgArr, begin_time, begin_time_half, end_time, end_time_half, lv_type, user_defined_field_1, dur_days, remark, ifEdit } = this.state;
        console.log(begin_time_half)
        if (lv_type.length == 0) {
            Toast.info('请选择请假类型');
            return
        }
        if (begin_time.length == 0 || begin_time_half.length == 0) {
            Toast.info('请选择开始时间');
            return
        }
        if (end_time.length == 0 || end_time.length == 0) {
            Toast.info('请选择结束时间');
            return
        }
        if (dur_days == '' || dur_days == '0' || dur_days == '0.0') {
            Toast.info('请选择正确的开始时间以及结束时间');
            return
        }
        if (!approver_id) {
            Toast.info('请选择审批人');
            return
        }
        //todo 处理end_time_half begin_time_half
        const obj = {
            imgArr,
            begin_time: format(new Date(begin_time).getTime(), 'yyyy-MM-dd'),
            begin_time_half: begin_time_half[0],
            end_time: format(new Date(end_time).getTime(), 'yyyy-MM-dd'),
            end_time_half: end_time_half[0],
            lv_type: lv_type[0],
            re_submit: 0,
            ifEdit,
            user_defined_field_1_value: user_defined_field_1 ? format(new Date(user_defined_field_1).getTime(), 'yyyy-MM-dd') : '',
            dur_days,
            remark,
            approver_id
        }
        //判断必填项是否填写
        const successFn = () => {
            this.props.navigation.goBack()
        }
        const failFn = (status) => {
            //判断错误类型
            const { resultdata, result, resultdesc } = status || {};
            if (resultdata && resultdata.severity == 'W') {
                this.refs.confirm.show(
                    {
                        title: '警告',
                        titleStyle: {
                            color: '#AA5A5B',
                        },
                        massage: resultdata.alert_message ? resultdata.alert_message : '剩余假期已不足',
                        okFn: () => {
                            this.props.User.postLvApply({ ...obj, re_submit: 1 }, successFn, failFn2);
                        },
                    }
                );
            }
            else if (resultdata && resultdata.severity == 'E') {
                Toast.fail(resultdata.alert_message ? resultdata.alert_message : status.resultdesc)
            } else if (result == 'ERR' && resultdesc) {
                Toast.fail(resultdesc)
            }
        }
        const failFn2 = (status) => {
            const { resultdata } = status || {};
            if (resultdata && resultdata.severity == 'W') {
                Toast.success('假期申请成功，请等待审核！', 3, () => {
                    this.props.navigation.goBack()
                })
            }
            else if (resultdata && resultdata.severity == 'E') {
                Toast.fail(resultdata.alert_message ? resultdata.alert_message : status.resultdesc)
            }
        }
        this.refs.confirm.show(
            {
                title: '提交',
                massage: '您确定提交请假信息吗？',
                okFn: () => {
                    this.props.User.postLvApply(obj, successFn, failFn);
                },
            }
        );
    }
    //判断请假时长
    justLvTime = async ({ begin_time, begin_time_half, end_time, end_time_half, lv_type }) => {
        begin_time_half = begin_time_half[0];
        end_time_half = end_time_half[0];
        //判断开始时间
        //判断当前的开始时间是否小于
        if (begin_time && end_time) {
            const beginTime = begin_time.getTime();
            const endTime = end_time.getTime();
            if (beginTime > endTime) {
                Toast.info('开始时间不能小于结束时间')
                return false;
            }
            else if (beginTime == endTime) {
                //判断选择的时间点
                if (begin_time_half && end_time_half) {
                    if (begin_time_half == 'PM' && end_time_half == 'AM') {
                        Toast.info('开始时间不能小于结束时间')
                        return false;
                    }
                    else if (begin_time_half != 'AM' && begin_time_half != 'PM') {
                        //将时间处理为数字
                        const beginTimeHalf = begin_time_half.getTime();
                        const endTimeHalf = end_time_half.getTime();
                        if (beginTimeHalf >= endTimeHalf) {
                            Toast.info('开始时间不能小于结束时间')
                            return false;
                        }
                    }
                } else {
                    return false;
                }
            }
        }
        //进行数据请求，请求请假时长
        if (lv_type) {
            const obj = {
                begin_time: format(begin_time.getTime(), 'yyyy-MM-dd'),
                begin_time_half,
                end_time: format(end_time.getTime(), 'yyyy-MM-dd'),
                end_time_half,
                lv_type: lv_type[0]
            }
            const dur_days = await this.props.User.getDurdays(obj);
            //设置请假时长
            this.setState({
                dur_days
            })

        }
        return true;
    }
    //更改假期类型
    changeType = (v) => {
        const { holidayType } = this.props.Common;
        //1， 如果某个假期类型对应的alert_msg_desc字段不为空的话，选择该假期的时候需要在假期类型下面显示这个字段的内容；为空的话，则不需要显示。
        // 2，如果某个假期类型对应的user_defined_field_1不为空的话，需要在”附件“字段后面添加一个字段，字段名称为user_defined_field_1字段的值，字段的控件类型为时间选择器，格式如2017-02-01；如果为空的话，则不需要显示。
        //遍历数组，获取到对应的信息
        let obj = {};
        holidayType && holidayType.map(info => {
            if (info.value == v) {
                obj = info;
            }
        })
        const { begin_time, begin_time_half, end_time, end_time_half } = this.state;
        //成功后的回调函数
        this.justLvTime({ begin_time, begin_time_half, end_time, end_time_half, lv_type: v });

        if (v && v[0]) {
            const { True } = this.props;
            True.selectTask = { function: 'LA', function_dtl: v[0] };
        }

        this.setState({
            lv_type: v,
            descStr: obj && obj.alert_msg_desc ? obj.alert_msg_desc : '',
            userDefined: obj && obj.user_defined_field_1 ? obj.user_defined_field_1 : ''
        });
    }
    //更改开始时间
    changeStart = (v) => {
        const { begin_time_half, end_time, end_time_half, lv_type } = this.state;
        //成功后的回调函数
        const flag = this.justLvTime({ begin_time: v, begin_time_half, end_time, end_time_half, lv_type });
        if (flag) {
            this.setState({
                begin_time: v
            })
        }
    }
    //更改开始上下午
    changeStartHalf = (v) => {
        const { begin_time, end_time, end_time_half, lv_type } = this.state;
        const flag = this.justLvTime({ begin_time, begin_time_half: v, end_time, end_time_half, lv_type });
        if (flag) {
            this.setState({
                begin_time_half: v
            })
        }
    }
    //更改结束时间
    changeEnd = (v) => {
        const { begin_time, begin_time_half, end_time_half, lv_type } = this.state;
        const flag = this.justLvTime({ begin_time, begin_time_half, end_time: v, end_time_half, lv_type });
        if (flag) {
            this.setState({
                end_time: v
            })
        }
    }
    //更改结束上下午
    changeEndHalf = (v) => {
        const { begin_time, begin_time_half, end_time, lv_type } = this.state;
        const flag = this.justLvTime({ begin_time, begin_time_half, end_time, end_time_half: v, lv_type });
        if (flag) {
            this.setState({
                end_time_half: v
            })
        }
    }
    //更改用户定义字段
    changeUserDefined = (v) => {
        console.log(v)
        this.setState({
            user_defined_field_1: v
        })
    }
    //更改请假理由
    changeRemark = (v) => {
        this.setState({
            remark: v
        })
    }

    componentWillMount() {
        //请求假期类型数据
        this.props.Common.getHolidayType();
    }

    renderStart = (halfTimeArr) => {
        // 如果enable_ta字段为N，则为上午和下午选择器；
        // 如果enable_ta字段为Y，则为填写具体的时间，如09:00。
        const { enable_ta } = Base.userInfo;
        return (
            <View>
                <View style={styles.timeTitle}>
                    <Text style={styles.timeText}><RequireData require={true} text="开始时间:"/></Text>
                </View>
                <DatePicker mode="date"
                            minDate={new Date(1900, 1, 1)}
                            onChange={this.changeStart}
                            value={this.state.begin_time}
                >
                    <List.Item arrow="horizontal"/>
                </DatePicker>
                {
                    enable_ta == 'N' ?
                        <Picker data={halfTimeArr} cols={1}
                                onChange={this.changeStartHalf}
                                value={this.state.begin_time_half}
                        >
                            <List.Item arrow="horizontal"/>
                        </Picker> :
                        <DatePicker mode="time"
                                    onChange={this.changeStartHalf}
                                    value={this.state.begin_time_half}
                                    minDate={new Date(1900, 1, 1)}

                        >
                            <List.Item arrow="horizontal"/>
                        </DatePicker>
                }
            </View>
        )
    }
    renderEnd = (halfTimeArr) => {
        // 如果enable_ta字段为N，则为上午和下午选择器；
        // 如果enable_ta字段为Y，则为填写具体的时间，如09:00。
        const { enable_ta } = Base.userInfo;

        return (
            <View>
                <View style={styles.timeTitle}>
                    <Text style={styles.timeText}><RequireData require={true} text="结束时间:"/></Text>
                </View>
                <DatePicker mode="date"
                            onChange={this.changeEnd}
                            value={this.state.end_time}
                            minDate={new Date(1900, 1, 1)}
                >
                    <List.Item arrow="horizontal"/>
                </DatePicker>
                {
                    enable_ta == 'N' ?
                        <Picker data={halfTimeArr} cols={1}
                                onChange={this.changeEndHalf}
                                value={this.state.end_time_half}
                        >
                            <List.Item arrow="horizontal"/>
                        </Picker> :
                        <DatePicker mode="time"
                                    minDate={new Date(1900, 1, 1)}
                                    onChange={this.changeEndHalf}
                                    value={this.state.end_time_half}

                        >
                            <List.Item arrow="horizontal"/>
                        </DatePicker>
                }
            </View>
        )
    }
    renderUserDefined = (str, value) => {
        return (
            <View>
                <DatePicker mode="date"
                            onChange={this.changeUserDefined}
                            minDate={new Date(1900, 1, 1)}
                            value={value}

                >
                    <List.Item arrow="horizontal"> {str} </List.Item>
                </DatePicker>
            </View>
        )
    }
    renderDurDays = (dur_days) => {
        return (
            <InputItem
                value={dur_days}
                editable={false}
            ><RequireData require={true} text="假期天数:"/></InputItem>
        )
    }
    renderRemark = (remark) => {
        return (
            <View>
                <View style={styles.timeTitle}>

                    <Text style={styles.timeText}>请假事由:</Text>
                </View>
                <TextareaItem
                    onChange={this.changeRemark}
                    placeholder={remark ? remark : "请输入请假事由"}
                    rows={5}
                    count={100}
                    style={{ fontSize: 16 }}
                    value={remark ? remark : ''}
                />
            </View>
        )
    }
    renderSubmitBtn = () => {
        return (
            <View style={{ backgroundColor: '#fff' }}>
                <WhiteSpace size="sm"/>
                <WingBlank>
                    <Button type="primary" onClick={this.onSubmit}>提交</Button>
                </WingBlank>
                <WhiteSpace size="sm"/>
            </View>
        )
    }

    render() {

        const { holidayType, halfTimeArr } = this.props.Common;
        const { lv_type, imgArr, userDefined, dur_days, remark, doctor_certificate, user_defined_field_1 } = this.state;
        let descStr = '';
        holidayType && holidayType.map(info => {
            if (info.value == lv_type) {
                descStr = info.alert_msg_desc;
            }
        })
        // const desc = descStr?"<div style=\"font-size: 24\">" + descStr + "</div>":"";
        const desc = descStr;

        return (
            <View style={{ overflow: 'scroll', height: '100%' }}>
                <ScrollView style={{ backgroundColor: '#fff' }}>
                    <Picker data={holidayType} cols={1}
                            onChange={this.changeType}
                            value={lv_type}
                    >
                        <List.Item arrow="horizontal"><RequireData require={true} text="假期类型:"/></List.Item>
                    </Picker>
                    {
                        // desc ?
                        //     <WebView
                        //         source={{ html: desc }}
                        //         scalesPageToFit={true}
                        //         style={{
                        //              // height: 80,
                        //             marginLeft: 10, paddingTop: 10, paddingBottom: 10, marginRight: 10
                        //         }}
                        //     /> :
                        //     null

                    }
                    {
                        desc ?
                            <HTMLView
                                value={desc}
                                style={{
                                    paddingTop: 15,
                                    paddingBottom: 15,
                                    paddingLeft: 15,
                                    paddingRight: 15,
                                }}
                            />
                            : null
                    }
                    {
                        this.renderStart(halfTimeArr)
                    }
                    {
                        this.renderEnd(halfTimeArr)
                    }
                    {
                        this.renderDurDays(dur_days)
                    }
                    {
                        this.renderRemark(remark)
                    }
                    <ImgSelect imgArr={imgArr} onSelect={this.onSelectImg}/>
                    {
                        userDefined ?
                            this.renderUserDefined(userDefined, user_defined_field_1) :
                            null
                    }
                    <ApprovingButton/>
                    <WhiteSpace size="xl"/>
                    <WhiteSpace size="xl"/>
                </ScrollView>

                <ShowConfirm ref="confirm"/>
                {
                    this.renderSubmitBtn()
                }
            </View>
        )
    }
}

const styles = StyleSheet.create({
    timeTitle: {
        height: 40,
        backgroundColor: '#f2f2f2'
    },
    timeText: {
        lineHeight: 40,
        marginLeft: 15,
    },
    image: {
        width: 100,
        height: 100,
        marginLeft: 15,
        marginTop: 10,
        marginBottom: 10,
    },
    text: {
        fontSize: 50,
        lineHeight: 80,
        marginLeft: 10
    },
    descView: {
        height: 100,
        marginLeft: 15,
    },
    descText: {
        // lineHeight: 80,
    }
})

export default createForm()(Index);
