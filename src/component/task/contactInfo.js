import React, { Component } from 'react';
import {
    Text,
    View,
    StyleSheet,
    PixelRatio,
    ScrollView,
    TextInput,
    Navigator,
    StatusBar
} from 'react-native';

import {
    Flex,
    WhiteSpace,
    Toast,
    WingBlank,
    Icon,
    Grid,
    Button,
    List,
    NavBar,
    InputItem,
    Picker,
    TextareaItem,
    DatePicker
} from 'antd-mobile';
import { inject, observer } from 'mobx-react/native';
import { createForm } from 'rc-form';
import ApprovingButton from './approvingButton';
import ApprovingHistory from './approvingHistory';

//引入第三方库
import { format } from '../../util/tool';
import { renderNameItem, renderRemark, renderHeadIconItem } from './common/index';

const Item = List.Item;
const Brief = Item.Brief;

@inject('User', 'Common', 'True')
@observer
class Index extends Component {

    static navigationOptions = ({ navigation }) => ({
        title: '联系人审批'
    });

    componentWillMount() {
        const { True } = this.props;
        True.emergencycontactDetailApiAction();
    }

    componentWillUnmount() {
        const { True, User } = this.props;
        True.emergencycontactDetail = {};

        if (True.selectTask.isMsg) {
            User.alertsList();
        } else {
            True.taskListAction();
        }
    }

    render() {
        let { True, navigation } = this.props;
        const { emergencycontactDetail, activeKey } = True;

        let {
            chinese_name,
            old_chinese_name,
            old_relate_type_desc,
            relate_type_desc,
            contact_no,
            old_contact_no,
            prc_age,
            old_prc_age,
            prc_work_unit,
            old_prc_work_unit,
            remark,
            message,
            comments,
            is_last_approve,
            cont_remark,

            user_photo,
            name,
            position
        } = emergencycontactDetail;

        return (
            <ScrollView>
                <List>
                    {
                        renderHeadIconItem(user_photo, name, position, this)
                    }

                    {
                        renderNameItem(relate_type_desc, old_relate_type_desc, '关系')
                    }
                    {
                        renderNameItem(chinese_name, old_chinese_name, '姓名')
                    }
                    {
                        renderNameItem(contact_no, old_contact_no, '电话')
                    }
                    {
                        renderNameItem(prc_age, old_prc_age, '年龄')
                    }
                    {
                        renderNameItem(prc_work_unit, old_prc_work_unit, '工作单位及职务')
                    }
                    {
                        renderNameItem(cont_remark, cont_remark, '关系描述')
                    }

                    {
                        renderRemark(remark)
                    }

                    {
                        activeKey == 'PE' &&
                        <ApprovingButton navigation={navigation} is_last_approve={is_last_approve}></ApprovingButton>
                    }

                    {
                        comments && comments.length > 0 && <ApprovingHistory comments={comments}></ApprovingHistory>
                    }
                </List>
            </ScrollView>
        )
    }
}

export default createForm()(Index);