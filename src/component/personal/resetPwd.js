import React, { Component } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet
} from 'react-native';
import {
    Flex,
    Toast,
    Icon,
    ActivityIndicator,
    Button,
    List,
    NavBar,
    Picker,
    WingBlank,
    WhiteSpace,
    TextareaItem,
    Checkbox
} from 'antd-mobile';
import { createForm } from 'rc-form';
import { inject, observer } from 'mobx-react/native';
import { observable, action, runInAction, computed, autorun } from 'mobx';
import { NavigationActions } from 'react-navigation'
import InputItem from '../InputItem';

const Item = List.Item;
const Brief = Item.Brief;
const AgreeItem = Checkbox.AgreeItem;

@inject('User','Base')
@observer
class Index extends Component {

    static navigationOptions = ({ navigation }) => ({
        title: '修改密码'
    });

    onSubmit() {
        const { User, form, navigation } = this.props;

        form.validateFields((err, values) => {
            console.log('err', err, values);
            if (!err) {
                if(values.old_password == values.new_password){
                    Toast.info('新密码不能与旧密码相同！');
                }else{
                    Toast.loading('加载中');
                    User.resetPwd(values.old_password, values.new_password, navigation, ()=>{
                        this.props.Base.userInfo = null;
                    });
                    // this.props.Base.logout();
                    // const resetAction = NavigationActions.reset({
                    //     index: 0,
                    //     actions: [
                    //         NavigationActions.navigate({ routeName: 'Login' })
                    //     ]
                    // })
                    // navigation.dispatch(resetAction);
                }
            }
            else {
                if (err.old_password) {
                    Toast.info(values.old_password.length>0&&values.old_password.length<7?'密码最少为7位':'请输入旧密码');
                }else if(err.new_password) {
                    Toast.info(values.new_password.length>0&&values.new_password.length<7?'密码最少为7位':'请输入新密码');
                }
            }
        });
    }

    @observable isShow = false;
    togglePwd = (e)=>{
        this.isShow = !this.isShow;
        // if(this.isShow){
        //     // console.log(this.refs.oldpwd);
        //     // this.refs.oldpwd.props.value = 'text';
        //     // console.log(this.refs.oldpwd.props.type);
        //
        // }
    }

    render() {
        const { form } = this.props;
        const { getFieldProps } = form;

        return (
            <View style={styles.view}>
                <WingBlank size='lg'>
                    <List renderHeader={() => '旧密码：'}>
                        <InputItem
                            type={this.isShow?'text':'password'}
                            style={styles.setBorder}
                            {
                                ...getFieldProps(
                                    'old_password',
                                    {
                                        rules: [
                                            {
                                                required: true,
                                                min: 7
                                            },
                                        ],
                                        initialValue: ''
                                    }
                                )
                            }
                            ref="oldpwd"
                        />
                    </List>
                    <List renderHeader={() => '新密码：'}>
                        <InputItem
                            type={this.isShow?'text':'password'}
                            style={styles.setBorder}
                            {
                                ...getFieldProps(
                                    'new_password',
                                    {
                                        rules: [
                                            {
                                                required: true,
                                                min: 7
                                            },
                                        ],
                                        initialValue: ''
                                    }
                                )
                            }
                            ref="newpwd"
                        />
                    </List>
                </WingBlank>

                <WingBlank style={{paddingTop:15}}>
                    <Flex>
                        <Flex.Item>
                            <AgreeItem
                                checkboxStyle={{
                                    tintColor: this.isShow ? '#3ba662' : '#999'
                                }}
                                onChange={ ()=>{this.togglePwd()} } >
                                显示密码
                            </AgreeItem>
                        </Flex.Item>
                    </Flex>
                </WingBlank>
                <WingBlank size='lg'>
                    <Button style={styles.button} type="primary" onPressIn={() => this.onSubmit()}>
                        提交
                    </Button>
                </WingBlank>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    view: {
        height: '100%',
        backgroundColor: '#f5f5f9',
    },
    button: {
        height: 50,
        borderRadius: 3,
        marginTop: 45,
        marginBottom: 20,
        // backgroundColor: '#58cb8c',
        borderColor: 'transparent'
    },
    setBorder: {
        borderColor: '#ccc'
    }
});

export default createForm()(Index);

